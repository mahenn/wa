// server/repositories/wa.chat.repository.ts
import { Chat } from '@adiwajshing/baileys';
import { WaBaseRepository } from './repository.base';
import { IChatRepository } from '../interfaces/chat.repository';

export class WaChatRepository extends WaBaseRepository<Chat> implements IChatRepository {
  async getAllWithMessages(pagination: PaginationParams, broadcast: boolean): Promise<Chat[]> {
    const query = this.model.query()
      .leftJoin('wa_messages', 'wa_chats.id', 'wa_messages.remoteJid');

    if (broadcast) {
      query.where('isBroadcast', true);
    }

    if (pagination) {
      // Apply pagination
      if (pagination.limit) {
        query.limit(pagination.limit);
      }
      if (pagination.offset) {
        query.offset(pagination.offset);
      }
      if (pagination.sortBy) {
        query.orderBy(pagination.sortBy, pagination.sortOrder);
      }
    }

    return query;
  }
}