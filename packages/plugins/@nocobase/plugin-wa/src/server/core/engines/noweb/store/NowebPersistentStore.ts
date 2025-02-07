import makeWASocket, {
  areJidsSameUser,
  BaileysEventEmitter,
  Chat,
  ChatUpdate,
  Contact,
  GroupParticipant,
  isRealMessage,
  jidNormalizedUser,
  ParticipantAction,
  proto,
  updateMessageWithReaction,
  updateMessageWithReceipt,
} from '@adiwajshing/baileys/src';
import { GroupMetadata } from '@adiwajshing/baileys/src/Types/GroupMetadata';
import { Label } from '@adiwajshing/baileys/src/Types/Label';
import {
  LabelAssociation,
  LabelAssociationType,
} from '@adiwajshing/baileys/src/Types/LabelAssociation';
import { IGroupRepository } from './IGroupRepository';
import { ILabelAssociationRepository } from './ILabelAssociationsRepository';
import { ILabelsRepository } from './ILabelsRepository';
import { GetChatMessagesFilter } from '../../../../structures/chats.dto';
import { PaginationParams, SortOrder } from '../../../../structures/pagination.dto';
import { DefaultMap } from '../../../../utils/DefaultMap';
import { sleep, waitUntil } from '../../../../utils/promiseTimeout';
import * as lodash from 'lodash';

import { toNumber } from 'lodash';
import { Logger } from 'pino';

import { IChatRepository } from './IChatRepository';
import { IContactRepository } from './IContactRepository';
import { IMessagesRepository } from './IMessagesRepository';
import { INowebStorage } from './INowebStorage';
import { INowebStore } from './INowebStore';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AsyncLock = require('async-lock');

type ms = number;
const HOUR: ms = 60 * 60 * 1000;

export class NowebPersistentStore implements INowebStore {
  private socket: ReturnType<typeof makeWASocket>;
  private chatRepo: IChatRepository;
  private groupRepo: IGroupRepository;
  private contactRepo: IContactRepository;
  private messagesRepo: IMessagesRepository;
  private labelsRepo: ILabelsRepository;
  private labelAssociationsRepo: ILabelAssociationRepository;
  public presences: any;
  private lock: any;

  private groupsFetchLock: any = new AsyncLock({
    maxPending: Infinity,
    maxExecutionTime: 60_000,
  });

  private lastTimeGroupUpdate: Date = new Date(0);
  private lastTimeGroupFetch: Date = new Date(0);
  private GROUP_METADATA_CACHE_TIME = 24 * HOUR;

  constructor(
    private logger: Logger,
    public storage: INowebStorage,
  ) {
    this.socket = null;
    this.chatRepo = storage.getChatRepository();
    //console.log("chat repo is ",this.chatRepo);
    this.groupRepo = storage.getGroupRepository();
    this.contactRepo = storage.getContactsRepository();
    this.messagesRepo = storage.getMessagesRepository();
    this.labelsRepo = storage.getLabelsRepository();
    this.labelAssociationsRepo = storage.getLabelAssociationRepository();
    this.presences = {};
    this.lock = new AsyncLock({ maxPending: Infinity });
  }

  init(): Promise<void> {
    return this.storage.init();
  }

  bind(ev: BaileysEventEmitter, socket: any) {
    // All
    ev.on('messaging-history.set', (data) => this.onMessagingHistorySet(data));
    // Messages
    ev.on('messages.upsert', (data) =>
      this.withLock('messages', () => this.onMessagesUpsert(data)),
    );
    ev.on('messages.update', (data) =>
      this.withLock('messages', () => this.onMessageUpdate(data)),
    );
    ev.on('messages.delete', (data) =>
      this.withLock('messages', () => this.onMessageDelete(data)),
    );
    ev.on('messages.reaction', (data) =>
      this.withLock('messages', () => this.onMessageReaction(data)),
    );
    ev.on('message-receipt.update', (data) =>
      this.withLock('messages', () => this.onMessageReceiptUpdate(data)),
    );
    // Chats
    ev.on('chats.upsert', (data) =>
      this.withLock('chats', () => this.onChatUpsert(data)),
    );
    ev.on('chats.update', (data) =>
      this.withLock('chats', () => this.onChatUpdate(data)),
    );
    ev.on('chats.delete', (data) =>
      this.withLock('chats', () => this.onChatDelete(data)),
    );
     // Groups
    ev.on('groups.upsert', (data) =>
      this.withLock('groups', () => this.onGroupUpsert(data)),
    );
    ev.on('groups.update', (data) =>
      this.withLock('groups', () => this.onGroupUpdate(data)),
    );
    ev.on('group-participants.update', (data) =>
      this.withLock(`group-${data.id}`, () =>
        this.onGroupParticipantsUpdate(data),
      ),
    );
    // Contacts
    ev.on('contacts.upsert', (data) =>
      this.withLock('contacts', () => this.onContactsUpsert(data)),
    );
    ev.on('contacts.update', (data) =>
      this.withLock('contacts', () => this.onContactUpdate(data)),
    );
    ev.on('labels.edit', (data) => this.onLabelsEdit(data));
    ev.on('labels.association', ({ association, type }) =>
      this.onLabelsAssociation(association, type),
    );
    // Presence
    ev.on('presence.update', (data) => this.onPresenceUpdate(data));

    this.socket = socket;
  }

  async close(): Promise<void> {
    await this.storage?.close().catch((error) => {
      this.logger.warn(`Failed to close storage: ${error}`);
    });
    return;
  }

  private async onMessagingHistorySet(history) {
    const { contacts, chats, messages, isLatest } = history;
    if (isLatest) {
      this.logger.debug(
        'history sync - clearing all entities, got latest history',
      );
      await Promise.all([
        this.withLock('contacts', () => this.contactRepo.deleteAll()),
        this.withLock('chats', () => this.chatRepo.deleteAll()),
        this.withLock('messages', () => this.messagesRepo.deleteAll()),

      ]);
    }

    await Promise.all([
      this.withLock('contacts', async () => {
        await this.onContactsUpsert(contacts);
        this.logger.info(`history sync - '${contacts.length}' synced contacts`);
      }),
      this.withLock('chats', () => this.onChatUpsert(chats)),
      this.withLock('messages', () => this.syncMessagesHistory(messages)),
    ]);
  }

  private async syncMessagesHistory(messages) {
    const realMessages = messages.filter(isRealMessage);
    await this.messagesRepo.upsert(realMessages);
    this.logger.info(
      `history sync - '${messages.length}' got messages, '${realMessages.length}' real messages`,
    );
  }

  private async onMessagesUpsert(update) {
    const { messages, type } = update;
    if (type !== 'notify' && type !== 'append') {
      this.logger.debug(`unexpected type for messages.upsert: '${type}'`);
      return;
    }
    const realMessages = messages.filter(isRealMessage);
    await this.messagesRepo.upsert(realMessages);
    //console.log("onmessageUpsert",realMessages)
    //await this.messagesRepo.save(realMessages);
    this.logger.debug(
      `messages.upsert - ${messages.length} got messages, ${realMessages.length} real messages`,
    );
  }

  private async onMessageUpdate(updates) {
    for (const update of updates) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const jid = jidNormalizedUser(update.key.remoteJid!);
      const message = await this.messagesRepo.getByJidById(jid, update.key.id);
      if (!message) {
        continue;
      }
      const fields = { ...update.update };
      // It can overwrite the key, so we need to delete it
      delete fields['key'];
      Object.assign(message, fields);
      // In case of revoked messages - remove it
      // TODO: May be we should save the flag instead of completely removing the message
      const isYetRealMessage =
        isRealMessage(message, this.socket?.authState?.creds?.me?.id) || false;
      if (isYetRealMessage) {
        await this.messagesRepo.upsertOne(message);
        //await this.messagesRepo.save(message);
      } else {
        await this.messagesRepo.deleteByJidByIds(jid, [update.key.id]);
      }
    }
  }

  private async onMessageDelete(item) {
    if ('all' in item) {
      await this.messagesRepo.deleteAllByJid(item.jid);
      return;
    }
    const jid = jidNormalizedUser(item.keys[0].remoteJid);
    const ids = item.keys.map((key) => key.id);
    await this.messagesRepo.deleteByJidByIds(jid, ids);
  }

  private async onChatUpsert(chats: Chat[]) {
    for (const chat of chats) {
      delete chat['messages'];
      chat.conversationTimestamp = toNumber(chat.conversationTimestamp);
      //console.log("chat data is here",chat);
      await this.chatRepo.save(chat);
    }
    this.logger.info(`store sync - '${chats.length}' synced chats`);
  }

  private async onGroupUpsert(groups: GroupMetadata[]) {
    for (const group of groups) {
      await this.groupRepo.save(group);
    }
    this.logger.info(`store sync - '${groups.length}' synced groups`);
  }

  private async onGroupUpdate(groups: Partial<GroupMetadata>[]) {
    for (const update of groups) {
      let group = await this.groupRepo.getById(update.id);
      group = Object.assign(group || {}, update) as GroupMetadata;
      await this.groupRepo.save(group);
    }
    this.logger.info(`store sync - '${groups.length}' updated groups`);
    this.lastTimeGroupUpdate = new Date();
  }

  private async onGroupParticipantsUpdate(data) {
    const id: string = data.id;
    const participants: string[] = data.participants;
    const action: ParticipantAction = data.action;

    if (action == 'remove') {
      // Remove the group if the current user is removed
      const myJid = this.socket?.authState?.creds?.me?.id;
      const participantsIncludesMe = lodash.find(participants, (p) =>
        areJidsSameUser(p, myJid),
      );
      if (participantsIncludesMe) {
        await this.groupRepo.deleteById(id);
        return;
      }
    }

    let group = await this.groupRepo.getById(id);
    if (!group) {
      group = { id: id, participants: [] } as GroupMetadata;
    }

    const participantsById = new DefaultMap<string, GroupParticipant>((key) => {
      return { id: key, admin: null } as GroupParticipant;
    });
    for (const participant of group.participants) {
      participantsById.set(participant.id, participant);
    }

    for (const participant of participants) {
      this.participantUpdate(participantsById, participant, action);
    }
    group.participants = Array.from(participantsById.values());
    await this.groupRepo.save(group);
  }

  private participantUpdate(
    participantsById: DefaultMap<string, GroupParticipant>,
    participant: string,
    action: ParticipantAction,
  ) {
    switch (action) {
      case 'add':
        // if there's no participant - add it (by id)
        participantsById.get(participant);
        break;
      case 'remove':
        // remove the participant (by id)
        participantsById.delete(participant);
        break;
      case 'promote':
        // set admin: admin
        participantsById.get(participant).admin = 'admin';
        break;
      case 'demote':
        participantsById.get(participant).admin = null;
        break;
    }
  }

  private async onChatUpdate(updates: ChatUpdate[]) {
    for (const update of updates) {
      const chat = (await this.chatRepo.getById(update.id)) || ({} as Chat);
      Object.assign(chat, update);
      chat.conversationTimestamp = toNumber(chat.conversationTimestamp);
      delete chat['messages'];
      //console.log("onChatUpdate data is here",chat)
      await this.chatRepo.save(chat);
    }
  }

  private async onChatDelete(ids: string[]) {
    for (const id of ids) {
      await this.chatRepo.deleteById(id);
      await this.messagesRepo.deleteAllByJid(id);
    }
  }

  private withLock(key, fn) {
    return this.lock.acquire(key, fn);
  }

  private async onContactsUpsert(contacts: Contact[]) {
    for (const update of contacts) {
      const contact = await this.contactRepo.getById(update.id);
      // remove undefined from data
      Object.keys(update).forEach(
        (key) => update[key] === undefined && delete update[key],
      );
      const result = { ...(contact || {}), ...update };

      //console.log("onContactsUpsert is here",result);



      await this.contactRepo.save(result);
    }
  }

  private async onContactUpdate(updates: Partial<Contact>[]) {
    for (const update of updates) {
      const contact = await this.contactRepo.getById(update.id);

      if (!contact) {
        this.logger.warn(
          `got update for non-existent contact. update: '${JSON.stringify(
            update,
          )}'`,
        );
        continue;
        // TODO: Find contact by hash if not found
        //  find contact by attrs.hash, when user is not saved as a contact
        //  check the in-memory for that
      }
      Object.assign(contact, update);

      if (update.imgUrl === 'changed') {
        try {
        contact.imgUrl = this.socket
          ? await this.socket?.profilePictureUrl(contact.id)
          : undefined;
          } catch (error) {
            if (error?.data === 404) {
              // Profile picture not found, set to undefined
              contact.imgUrl = undefined;
              this.logger.debug(`No profile picture found for contact ${contact.id}`);
            } else {
              this.logger.debug(`Error fetching profile picture for contact ${contact.id}`);
              // Rethrow other errors
             /// throw error;
            }
          }
      } else if (update.imgUrl === 'removed') {
        delete contact.imgUrl;
      }
      await this.onContactsUpsert([contact]);
    }
  }

  private async onMessageReaction(reactions) {
    for (const { key, reaction } of reactions) {
      const msg = await this.messagesRepo.getByJidById(key.remoteJid, key.id);
      if (!msg) {
        this.logger.warn(
          `got reaction update for non-existent message. key: '${JSON.stringify(
            key,
          )}'`,
        );
        continue;
      }
      updateMessageWithReaction(msg, reaction);
      await this.messagesRepo.upsertOne(msg);
      //await this.messagesRepo.save(msg);
    }
  }

  private async onMessageReceiptUpdate(updates) {
    for (const { key, receipt } of updates) {
      const msg = await this.messagesRepo.getByJidById(key.remoteJid, key.id);
      if (!msg) {
        this.logger.warn(
          `got receipt update for non-existent message. key: '${JSON.stringify(
            key,
          )}'`,
        );
        continue;
      }
      updateMessageWithReceipt(msg, receipt);
      await this.messagesRepo.upsertOne(msg);
      //await this.messagesRepo.save(msg);
    }
  }

  private async onLabelsEdit(label: Label) {
    if (label.deleted) {
      await this.labelsRepo.deleteById(label.id);
      await this.labelAssociationsRepo.deleteByLabelId(label.id);
    } else {
      await this.labelsRepo.save(label);
    }
  }

  private async onLabelsAssociation(
    association: LabelAssociation,
    type: 'add' | 'remove',
  ) {
    if (type === 'remove') {
      await this.labelAssociationsRepo.deleteOne(association);
    } else {
      await this.labelAssociationsRepo.save(association);
    }
  }

  private async onPresenceUpdate({ id, presences: update }) {
    this.presences[id] = this.presences[id] || {};
    Object.assign(this.presences[id], update);
  }

  async loadMessage(jid: string, id: string) {
    const data = await this.messagesRepo.getByJidById(jid, id);
    if (!data) {
      return null;
    }
    return proto.WebMessageInfo.fromObject(data);
  }

  getMessagesByJid(
    chatId: string,
    filter: GetChatMessagesFilter,
    pagination: PaginationParams,
  ): Promise<any> {
    pagination.sortBy = 'messageTimestamp';
    pagination.sortOrder = SortOrder.DESC;
    return this.messagesRepo.getAllByJid(chatId, filter, pagination);
  }

  getMessageById(chatId: string, messageId: string): Promise<any> {
    return this.messagesRepo.getByJidById(chatId, messageId);
  }

  getChats(pagination: PaginationParams, broadcast: boolean): Promise<Chat[]> {
    pagination.sortBy ||= 'conversationTimestamp';
    pagination.sortOrder ||= SortOrder.DESC;

    return this.chatRepo.getAllWithMessages(pagination, broadcast);
  }

  private shouldFetchGroup(): boolean {
    const timePassed = new Date().getTime() - this.lastTimeGroupFetch.getTime();
    return timePassed > this.GROUP_METADATA_CACHE_TIME;
  }

  private async fetchGroups() {
    await this.groupsFetchLock.acquire('groups-fetch', async () => {
      if (!this.shouldFetchGroup()) {
        // Update has been done by another request
        return;
      }
      const lastTimeGroupUpdate = this.lastTimeGroupUpdate;
      await this.groupRepo.deleteAll();
      await this.socket?.groupFetchAllParticipating();
      // Wait until the groups update is done
      await waitUntil(
        async () => this.lastTimeGroupUpdate > lastTimeGroupUpdate,
        100,
        5_000,
      );
      this.lastTimeGroupFetch = new Date();
    });
  }

  resetGroupsCache() {
    this.lastTimeGroupFetch = new Date(0);
  }

  async getGroups(pagination: PaginationParams): Promise<GroupMetadata[]> {
    if (this.shouldFetchGroup()) {
      await this.fetchGroups();
    }
    return this.groupRepo.getAll(pagination);
  }

  getContactById(jid) {
    return this.contactRepo.getById(jid);
  }

  getContacts(pagination: PaginationParams) {
    return this.contactRepo.getAll(pagination);
  }

  getLabels(): Promise<Label[]> {
    return this.labelsRepo.getAll();
  }

  getLabelById(labelId: string): Promise<Label | null> {
    return this.labelsRepo.getById(labelId);
  }

  async getChatsByLabelId(labelId: string): Promise<Chat[]> {
    const associations =
      await this.labelAssociationsRepo.getAssociationsByLabelId(
        labelId,
        LabelAssociationType.Chat,
      );
    const ids = associations.map((association) => association.chatId);
    return await this.chatRepo.getAllByIds(ids);
  }

  async getChatLabels(chatId: string): Promise<Label[]> {
    const associations =
      await this.labelAssociationsRepo.getAssociationsByChatId(chatId);
    const ids = associations.map((association) => association.labelId);
    return await this.labelsRepo.getAllByIds(ids);
  }
}
