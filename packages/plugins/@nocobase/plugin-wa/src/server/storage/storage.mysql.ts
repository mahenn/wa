// server/storage/wa.storage.mysql.ts
import { Database } from '@nocobase/database';
import { INowebStorage } from '../core/engines/noweb/store/INowebStorage';
import { WaChatRepository } from '../repositories/chat.repository';
import { WaContactRepository } from '../repositories/contact.repository';
import { WaGroupRepository } from '../repositories/group.repository';
import { WaMessageRepository } from '../repositories/message.repository';
import { WaLabelRepository } from '../repositories/label.repository';
import { WaLabelAssociationRepository } from '../repositories/label-association.repository';

export class WaMySQLStorage extends INowebStorage {
  
  constructor(private readonly db: Database) {
    super();
  }

  async init(): Promise<void> {
    // Collections are auto-initialized by NocoBase
    await this.db.sync();
  }

  async close(): Promise<void> {
    //await this.db.close();
  }

  getChatRepository(): WaChatRepository {
    //return this.db.getRepository('wa_chats') as WaChatRepository;
    const repository = this.db.getRepository('wa_chats');
    Object.setPrototypeOf(repository, WaChatRepository.prototype);
    return repository as WaChatRepository;
  }

  getContactsRepository() {
    //return this.db.getRepository('wa_contacts') as WaContactRepository;
    const repository = this.db.getRepository('wa_contacts');
    Object.setPrototypeOf(repository, WaContactRepository.prototype);
    return repository as WaContactRepository;
  }

  getGroupRepository() {
    //return this.db.getRepository('wa_groups') as WaGroupRepository;
    const repository = this.db.getRepository('wa_groups');
    Object.setPrototypeOf(repository, WaGroupRepository.prototype);
    return repository as WaGroupRepository;
  }

  getMessagesRepository() {
    //return this.db.getRepository('wa_messages') as WaMessageRepository;
    const repository = this.db.getRepository('wa_messages');
    Object.setPrototypeOf(repository, WaMessageRepository.prototype);
    return repository as WaMessageRepository;
  }

  getLabelsRepository() {
    //return this.db.getRepository('wa_labels') as WaLabelRepository;
    const repository = this.db.getRepository('wa_labels');
    Object.setPrototypeOf(repository, WaLabelRepository.prototype);
    return repository as WaLabelRepository;
  }

  getLabelAssociationRepository() {
    //return this.db.getRepository('wa_label_associations') as WaLabelAssociationRepository;
    const repository = this.db.getRepository('wa_label_associations');
    Object.setPrototypeOf(repository, WaLabelAssociationRepository.prototype);
    return repository as WaLabelAssociationRepository;
  }
}