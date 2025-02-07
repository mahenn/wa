// repositories/wa.message.repository.ts
import { WAMessage, proto } from '@adiwajshing/baileys/src';
import { Repository } from '@nocobase/database';
import { IMessagesRepository } from '../core/engines/noweb/store/IMessagesRepository';
import { PaginationParams } from '../structures/pagination.dto';
import { GetChatMessagesFilter } from '../structures/chats.dto';
import { WaBaseRepository } from './repository.base';

export class WaMessageRepository extends WaBaseRepository<WAMessage> implements IMessagesRepository {
  async deleteAll(): Promise<void> {
    await this.destroy({
      where: {}
    });
  }

  private getMessageData(message: any) {
    return {
      id: message.key.id,
      remoteJid: message.key.remoteJid,
      data: message,
      messageTimestamp: message.messageTimestamp,
      pushName: message.pushName,
      message: JSON.stringify(message.message),
      messageType: message.messageType
    };
  }

  async upsert(messages: any[]): Promise<void> {
    // await this.createMany({
    //   records: messages.map(msg => ({
    //     id: msg.key.id,
    //     remoteJid: msg.key.remoteJid,
    //     data: msg,
    //     messageTimestamp: msg.messageTimestamp,
    //     pushName: msg.pushName,
    //     message: JSON.stringify(msg.message),
    //     messageType: msg.messageType
    //   }))
    // });

     for (const message of messages) {
      await this.saveEntity(message, message.key.id, this.getMessageData);
    }
  }

  async upsertOne(message: any): Promise<void> {
    // await this.create({
    //   values: {
    //     id: message.key.id,
    //     remoteJid: message.key.remoteJid,
    //     data: message,
    //     messageTimestamp: message.messageTimestamp,
    //     pushName: message.pushName,
    //     message: JSON.stringify(message.message),
    //     messageType: message.messageType
    //   }
    // });

    await this.saveEntity(message, message.key.id, this.getMessageData);
  }

  async getAllByJid(
    jid: string,
    filter: GetChatMessagesFilter,
    pagination: PaginationParams,
  ): Promise<any[]> {

    const  rows  = await this.find({
      filter: {
        remoteJid: jid,
        ...filter
      },
      pagination
    });
    return rows.map(row => row.data);
  }

  async getByJidById(jid: string, id: string): Promise<any | null> {
    const message = await this.findOne({
      filter: {
        remoteJid: jid,
        id: id
      }
    });
    return message?.data;
  }

  async updateByJidAndId(jid: string, id: string, update: any): Promise<boolean> {
    const [count] = await this.update({
      filter: {
        remoteJid: jid,
        id: id
      },
      values: {
        data: update
      }
    });
    return count > 0;
  }

  async deleteByJidByIds(jid: string, ids: string[]): Promise<void> {
    await this.destroy({
      filter: {
        remoteJid: jid,
        id: {
          $in: ids
        }
      }
    });
  }

  async deleteAllByJid(jid: string): Promise<void> {
    await this.destroy({
      filter: {
        remoteJid: jid
      }
    });
  }
}