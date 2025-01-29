// server/storage/wa.storage.mysql.ts
import { Database } from '@nocobase/database';
import { INowebStorage } from '../interfaces/storage';
import { WaChatRepository } from '../repositories/chat.repository';
import { WaContactRepository } from '../repositories/contact.repository';
import { WaGroupRepository } from '../repositories/group.repository';
import { WaMessageRepository } from '../repositories/message.repository';
import { WaLabelRepository } from '../repositories/label.repository';
import { WaLabelAssociationRepository } from '../repositories/label-association.repository';

export class WaMySQLStorage implements INowebStorage {
  private db: Database;
  constructor(private db: Database) {}

  async init(): Promise<void> {
    // Collections are auto-initialized by NocoBase
    await this.db.sync();
  }

  async close(): Promise<void> {
    //await this.db.close();
  }

  getChatRepository() {
    return this.db.getRepository('wa_chats') as WaChatRepository;
  }

  getContactsRepository() {
    return this.db.getRepository('wa_contacts') as WaContactRepository;
  }

  getGroupRepository() {
    return this.db.getRepository('wa_groups') as WaGroupRepository;
  }

  getMessagesRepository() {
    return this.db.getRepository('wa_messages') as WaMessageRepository;
  }

  getLabelsRepository() {
    return this.db.getRepository('wa_labels') as WaLabelRepository;
  }

  getLabelAssociationRepository() {
    return this.db.getRepository('wa_label_associations') as WaLabelAssociationRepository;
  }
}