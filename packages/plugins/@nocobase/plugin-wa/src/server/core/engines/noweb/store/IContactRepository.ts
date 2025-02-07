import { Contact } from '@adiwajshing/baileys/src';
import { PaginationParams } from '../../../../structures/pagination.dto';


export interface IContactRepository {
  getAll(pagination?: PaginationParams): Promise<Contact[]>;

  getById(id: string): Promise<Contact | null>;

  deleteAll(): Promise<void>;

  deleteById(id: string): Promise<void>;

  save(contact: Contact): Promise<void>;
}
