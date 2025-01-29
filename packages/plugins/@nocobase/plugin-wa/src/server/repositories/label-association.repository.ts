// repositories/wa.label-association.repository.ts
import { LabelAssociation, LabelAssociationType } from '@adiwajshing/baileys/src/Types/LabelAssociation';
import { Repository } from '@nocobase/database';
import { ILabelAssociationRepository } from '../core/engines/noweb/store/ILabelAssociationsRepository';

export class WaLabelAssociationRepository extends Repository implements ILabelAssociationRepository {
  async deleteOne(association: LabelAssociation): Promise<void> {
    await this.destroy({
      filter: {
        type: association.type,
        chatId: association.chatId,
        labelId: association.labelId,
        messageId: association.messageId || null
      }
    });
  }

  async save(association: LabelAssociation): Promise<void> {
    await this.create({
      values: {
        id: `${association.labelId}-${association.chatId}-${association.type}`,
        data: association,
        type: association.type,
        labelId: association.labelId,
        chatId: association.chatId,
        messageId: association.messageId
      }
    });
  }

  async deleteByLabelId(labelId: string): Promise<void> {
    await this.destroy({
      filter: { labelId }
    });
  }

  async getAssociationsByLabelId(labelId: string, type: LabelAssociationType): Promise<LabelAssociation[]> {
    const { rows } = await this.find({
      filter: {
        type,
        labelId
      }
    });
    return rows.map(row => row.data);
  }

  async getAssociationsByChatId(chatId: string): Promise<LabelAssociation[]> {
    const { rows } = await this.find({
      filter: {
        chatId,
        type: LabelAssociationType.Chat
      }
    });
    return rows.map(row => row.data);
  }
}