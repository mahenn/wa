// repositories/wa.message.repository.ts
import { WAMessage, proto } from '@adiwajshing/baileys';
import { Repository } from '@nocobase/database';
import { IMessageRepository } from '../core/engines/noweb/store/IMessageRepository';
import { PaginationParams } from '../structures/pagination.dto';

export class WaMessageRepository extends Repository implements IMessageRepository {
  async getAll(pagination?: PaginationParams): Promise<WAMessage[]> {
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

  async getAllByJid(
    remoteJid: string, 
    pagination?: PaginationParams
  ): Promise<WAMessage[]> {
    const query: any = {
      filter: {
        remoteJid
      }
    };
    
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

  async getById(id: string): Promise<WAMessage | null> {
    const message = await this.findOne({
      filter: { id }
    });
    return message?.data || null;
  }

  async getByRemoteJidAndId(
    remoteJid: string, 
    id: string
  ): Promise<WAMessage | null> {
    const message = await this.findOne({
      filter: {
        remoteJid,
        id
      }
    });
    return message?.data || null;
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

  async deleteByJid(remoteJid: string): Promise<void> {
    await this.destroy({
      filter: { remoteJid }
    });
  }

  async save(message: WAMessage): Promise<void> {
    // Extract relevant fields from the message
    const messageContent = message.message;
    let messageType = 'unknown';
    let messageText = '';

    // Determine message type and extract text content
    if (messageContent) {
      if (messageContent.conversation) {
        messageType = 'conversation';
        messageText = messageContent.conversation;
      } else if (messageContent.imageMessage) {
        messageType = 'image';
        messageText = messageContent.imageMessage.caption || '';
      } else if (messageContent.videoMessage) {
        messageType = 'video';
        messageText = messageContent.videoMessage.caption || '';
      } else if (messageContent.documentMessage) {
        messageType = 'document';
        messageText = messageContent.documentMessage.fileName || '';
      } else if (messageContent.audioMessage) {
        messageType = 'audio';
      } else if (messageContent.stickerMessage) {
        messageType = 'sticker';
      }
    }

    // Create or update the message record
    await this.create({
      values: {
        id: message.key.id,
        remoteJid: message.key.remoteJid,
        data: message,
        messageTimestamp: message.messageTimestamp,
        pushName: message.pushName,
        message: messageText,
        messageType: messageType,
        key: JSON.stringify(message.key)
      }
    });
  }

  async updateMessage(
    remoteJid: string, 
    id: string, 
    message: Partial<proto.IMessage>
  ): Promise<void> {
    const existingMessage = await this.getByRemoteJidAndId(remoteJid, id);
    if (existingMessage) {
      const updatedMessage = {
        ...existingMessage,
        message: {
          ...existingMessage.message,
          ...message
        }
      };

      await this.save(updatedMessage);
    }
  }

  async getLastMessagesByJid(
    remoteJid: string, 
    limit: number
  ): Promise<WAMessage[]> {
    const { rows } = await this.find({
      filter: {
        remoteJid
      },
      sort: [['messageTimestamp', 'desc']],
      limit
    });
    return rows.map(row => row.data);
  }

  async search(
    query: string,
    pagination?: PaginationParams
  ): Promise<WAMessage[]> {
    const searchQuery: any = {
      filter: {
        message: {
          $like: `%${query}%`
        }
      }
    };

    if (pagination) {
      searchQuery.limit = pagination.limit;
      searchQuery.offset = pagination.offset;
      if (pagination.sortBy) {
        searchQuery.sort = [[pagination.sortBy, pagination.sortOrder]];
      }
    }

    const { rows } = await this.find(searchQuery);
    return rows.map(row => row.data);
  }

  async searchByJid(
    remoteJid: string,
    query: string,
    pagination?: PaginationParams
  ): Promise<WAMessage[]> {
    const searchQuery: any = {
      filter: {
        remoteJid,
        message: {
          $like: `%${query}%`
        }
      }
    };

    if (pagination) {
      searchQuery.limit = pagination.limit;
      searchQuery.offset = pagination.offset;
      if (pagination.sortBy) {
        searchQuery.sort = [[pagination.sortBy, pagination.sortOrder]];
      }
    }

    const { rows } = await this.find(searchQuery);
    return rows.map(row => row.data);
  }
}