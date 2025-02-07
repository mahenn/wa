// server/repositories/wa.group.repository.ts
import { GroupMetadata } from '@adiwajshing/baileys/src';
import { Repository } from '@nocobase/database';
import { IGroupRepository } from '../core/engines/noweb/store/IGroupRepository';
import { PaginationParams } from '../structures/pagination.dto';
import { WaBaseRepository } from './repository.base';


export class WaGroupRepository extends WaBaseRepository<GroupMetadata> implements IGroupRepository {
  async getAll(pagination?: PaginationParams): Promise<GroupMetadata[]> {
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

  async getById(id: string): Promise<GroupMetadata | null> {
    const group = await this.findOne({
      filter: { id }
    });
    return group?.data || null;
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

  async save(group: GroupMetadata): Promise<void> {
    // await this.create({
    //   values: {
    //     id: group.id,
    //     data: group,
    //     subject: group.subject,
    //     participants: group.participants,
    //     owner: group.owner,
    //     desc: group.desc,
    //     size: group.size
    //   }
    // });

    const getEntityData = (group: GroupMetadata) => ({
      id: group.id,
      data: group,
      subject: group.subject,
      participants: group.participants,
      owner: group.owner,
      desc: group.desc,
      size: group.size
    });

    await this.saveEntity(group, group.id, getEntityData);
  }
}