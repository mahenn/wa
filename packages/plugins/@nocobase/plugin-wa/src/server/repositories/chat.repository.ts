// server/repositories/wa.chat.repository.ts
import { Chat } from '@adiwajshing/baileys/src';
import { WaBaseRepository } from './repository.base';
import { PaginationParams } from '../structures/pagination.dto';

interface ExtendedChat extends Omit<Chat, 'pinned'> {
  isGroup?: boolean;
  isBroadcast?: boolean;
  pinned?: any;
  archived?: boolean;
  unreadCount?: number;
  conversationTimestamp?: number;
}

export interface IChatRepository {
  save(chat: ExtendedChat): Promise<void>;
  getAllWithMessages(pagination: PaginationParams, broadcast: boolean): Promise<ExtendedChat[]>;
  getAll(): Promise<ExtendedChat[]>;
  getAllByIds(ids: string[]): Promise<ExtendedChat[]>;
}





export class WaChatRepository extends WaBaseRepository<ExtendedChat> implements IChatRepository {
  async save(chat: ExtendedChat): Promise<void> {
    // console.log("chat data here",chat);
    // try {
    //   // Check if chat already exists
    //   const existingChat = await this.findOne({
    //     filter: { id: chat.id }
    //   });

    //   const chatData = {
    //     id: chat.id,
    //     name: chat.name,
    //     data: chat, // Store the full chat object in data field
    //     conversationTimestamp: chat.conversationTimestamp || null,
    //     unreadCount: chat.unreadCount || 0,
    //     pinned: chat.pinned || false,
    //     archived: chat.archived || false,
    //     isGroup: chat.isGroup || false,
    //     isBroadcast: chat.id.endsWith('@broadcast') || chat.id.endsWith('@newsletter')
    //   };

    //   if (existingChat) {
    //     // Update existing chat
    //      await this.update({
    //       filter: { id: chat.id },  // Filter must be at the top level
    //       values: chatData
    //     });
    //   } else {
    //     // Create new chat
    //     await this.create({values:chatData});
    //   }
    // } catch (error) {
    //   console.error('Error saving chat:', error);
    //   throw error;
    // }

    return this.saveEntity(chat, chat.id, (chat) => ({
      id: chat.id,
      name: chat.name,
      data: chat,
      conversationTimestamp: chat.conversationTimestamp,
      unreadCount: chat.unreadCount,
      pinned: chat.pinned,
      archived: chat.archived,
      isGroup: chat.isGroup,
      isBroadcast: chat.id.endsWith('@broadcast') || chat.id.endsWith('@newsletter')
    }));


  }

async getAllWithMessages(pagination: PaginationParams, broadcast: boolean): Promise<ExtendedChat[]> {
  try {
    
    // Execute the query using find()
    const result = await this.find({
     pagination, // Pass pagination directly, base class will handle sorting
      filter: broadcast ? { isBroadcast: true } : {isBroadcast: false}
    });

    // Map the results to Chat objects
    return result.map(row => {
      const chatData = row.dataValues || row;
      return {
      id: chatData.id,
      name: chatData.name,
      conversationTimestamp: chatData.conversationTimestamp,
      unreadCount: chatData.unreadCount,
      pinned: chatData.pinned,
      archived: chatData.archived,
      isGroup: chatData.isGroup,
      isBroadcast: chatData.isBroadcast,
      ...chatData.data
      };
    });

  } catch (error) {
    console.error('Error in getAllWithMessages:', error);
    throw error;
  }
}

  async getAll(): Promise<ExtendedChat[]> {
    const results = await this.find({filter:{}});
    return results.map(row => row.data as ExtendedChat);
  }

  async getAllByIds(ids: string[]): Promise<ExtendedChat[]> {
    const results = await this.find({
      filter: {
        id: {
          $in: ids
        }
      }
    });
    return results.map(row => row.data as ExtendedChat);
  }

  async getById(id: string): Promise<ExtendedChat | null> {
    const result = await this.findOne({
      filter: { id }
    });
    return result ? result.data as ExtendedChat : null;
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
}