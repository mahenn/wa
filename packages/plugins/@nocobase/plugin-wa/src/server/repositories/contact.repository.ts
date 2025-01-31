// server/repositories/wa.contact.repository.ts
import { Contact } from '@adiwajshing/baileys';
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

    console.log("getby id contact called");
    const contact = await this.findOne({
      filter: { id: id }
    });
    console.log("contact is here",contact);
    return contact || null;
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
    console.log("are youy coming here");
    try {
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
      }, {
        // Add upsert options
        individualHooks: true,
        updateOnDuplicate: ['data', 'name', 'notify', 'verifiedName', 'imgUrl', 'status']
      });
    } catch (error) {
      // Handle specific errors if needed
      if (error.code === 'ER_DUP_ENTRY') {
        // Update existing contact
        await this.update({
          values: {
            data: contact,
            name: contact.name || '',
            notify: contact.notify || '',
            verifiedName: contact.verifiedName || '',
            imgUrl: contact.imgUrl || '',
            status: contact.status || ''
          },
          filter: {
            id: contact.id
          }
        });
      } else {
        //throw error;
      }
    }
  }
}