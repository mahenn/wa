// server/repositories/wa.contact.repository.ts
import { Contact } from '@adiwajshing/baileys';
import { Repository } from '@nocobase/database';
import { IContactRepository } from '../core/engines/noweb/store/IContactRepository';
import { PaginationParams } from '../structures/pagination.dto';

export class WaContactRepository extends Repository implements IContactRepository {
  async getAll(pagination?: PaginationParams): Promise<Contact[]> {
    const query: any = {};
    
    if (pagination) {
      query.limit = pagination.limit;
      query.offset = pagination.offset;
      if (pagination.sortBy) {
        query.sort = [[pagination.sortBy, pagination.sortOrder]];
      }
    }

    const { rows } = await this.find(query);
    return rows.map(row => row.data);
  }

  async getById(id: string): Promise<Contact | null> {
    const contact = await this.findOne({
      filter: { id }
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
    await this.create({
      values: {
        id: contact.id,
        data: contact,
        name: contact.name,
        notify: contact.notify,
        verifiedName: contact.verifiedName,
        imgUrl: contact.imgUrl,
        status: contact.status
      }
    });
  }
}