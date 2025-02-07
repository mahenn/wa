import { Chat } from '@adiwajshing/baileys/src';
import { PaginationParams } from '../../../../structures/pagination.dto';


export interface IChatRepository {
  getAll(): Promise<Chat[]>;

  getAllByIds(ids: string[]): Promise<Chat[]>;

  getAllWithMessages(
    pagination: PaginationParams,
    broadcast: boolean,
  ): Promise<Chat[]>;

  getById(id: string): Promise<Chat | null>;

  deleteAll(): Promise<void>;

  deleteById(id: string): Promise<void>;

  save(chat: Chat): Promise<void>;
}
