// server/repositories/wa.repository.base.ts
import { Repository } from '@nocobase/database';
import { PaginationParams } from '../structures/pagination.dto';

export class WaBaseRepository<T> extends Repository {
  async getAll(pagination?: PaginationParams): Promise<T[]> {
    const query = this.model.query();
    
    if (pagination) {
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

  async getById(id: string): Promise<T | null> {
    return this.model.findOne({
      where: { id }
    });
  }

  async deleteAll(): Promise<void> {
    await this.model.destroy({
      where: {}
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.model.destroy({
      where: { id }
    });
  }

  async save(data: T): Promise<void> {
    await this.model.upsert(data);
  }
}
