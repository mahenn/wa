// server/repositories/wa.contact.repository.ts
import { Contact } from '@adiwajshing/baileys/src';
import { Repository } from '@nocobase/database';
import { IContactRepository } from '../core/engines/noweb/store/IContactRepository';
import { PaginationParams } from '../structures/pagination.dto';
import { WaBaseRepository } from './repository.base';

export class WaContactRepository extends WaBaseRepository<Contact> implements IContactRepository {
  async getAll(pagination?: PaginationParams): Promise<Contact[]> {
    const query: any = {};
    const { rows } = await this.find(pagination);
    return rows.map(row => row.data);
  }

  async getById(id: string): Promise<Contact | null> {

    const contact = await this.findOne({
      filter: { id: id }
    });
    return contact?.data || null;
  }

  async deleteAll(): Promise<void> {
    await this.destroy({
      filter: {}
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.destroy({
      filter: { id }
    });
  }

  async save(contact: Contact): Promise<void> {
    return this.saveEntity(contact, contact.id, (contact) => ({
      id: contact.id,
      data: contact,
      name: contact.name,
      notify: contact.notify,
      verifiedName: contact.verifiedName,
      imgUrl: contact.imgUrl,
      status: contact.status
    }));
  }
}