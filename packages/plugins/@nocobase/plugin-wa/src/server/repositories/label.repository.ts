//repositories/wa.label.repository.ts
import { Label } from '@adiwajshing/baileys/src/Types/Label';
import { Repository } from '@nocobase/database';
import { ILabelsRepository } from '../core/engines/noweb/store/ILabelsRepository';
import { WaBaseRepository } from './repository.base';


export class WaLabelRepository extends WaBaseRepository<Label>  implements ILabelsRepository {
  async getById(id: string): Promise<Label | null> {
    const label = await this.findOne({
      filter: { id }
    });
    return label?.data || null;
  }

  async getAll(): Promise<Label[]> {
    const { rows } = await this.find();
    return rows.map(row => row.data);
  }

  async getAllByIds(ids: string[]): Promise<Label[]> {
    const { rows } = await this.find({
      filter: {
        id: {
          $in: ids
        }
      }
    });
    return rows.map(row => row.data);
  }

  async deleteById(id: string): Promise<void> {
    await this.destroy({
      filter: { id }
    });
  }

  async save(label: Label): Promise<void> {
    // await this.create({
    //   values: {
    //     id: label.id,
    //     data: label,
    //     name: label.name,
    //     color: label.color,
    //     predefinedId: label.predefinedId
    //   }
    // });
    const getEntityData = (label: Label) => ({
      id: label.id,
      data: label,
      name: label.name,
      color: label.color,
      predefinedId: label.predefinedId
    });

    await this.saveEntity(label, label.id, getEntityData);
  }
}
