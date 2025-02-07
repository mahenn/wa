import { WAMessage } from '@adiwajshing/baileys/src';
import { LabelAssociation } from '@adiwajshing/baileys/src/Types/LabelAssociation';
import { IGroupRepository } from './IGroupRepository';
import { ILabelAssociationRepository } from './ILabelAssociationsRepository';
import { ILabelsRepository } from './ILabelsRepository';
import { IChatRepository } from './IChatRepository';
import { IContactRepository } from './IContactRepository';
import { IMessagesRepository } from './IMessagesRepository';


export abstract class INowebStorage {
  abstract init(): Promise<void>;

  abstract close(): Promise<void>;

  abstract getContactsRepository(): IContactRepository;

  abstract getChatRepository(): IChatRepository;

  abstract getGroupRepository(): IGroupRepository;

  abstract getMessagesRepository(): IMessagesRepository;

  abstract getLabelsRepository(): ILabelsRepository;

  abstract getLabelAssociationRepository(): ILabelAssociationRepository;

  protected getMessagesMetadata(): Map<string, any> {
    return new Map()
      .set('jid', (msg: WAMessage) => msg.key.remoteJid)
      .set('id', (msg: WAMessage) => msg.key.id)
      .set('messageTimestamp', (msg: WAMessage) => msg.messageTimestamp);
  }

  protected getLabelAssociationMetadata() {
    return new Map().set(
      'id',
      (a: LabelAssociation) =>
        // @ts-ignore
        `${a.type}_${a.labelId}_${a.chatId}_${a.messageId}`,
    );
  }
}
