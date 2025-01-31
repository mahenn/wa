import { Repository } from '@nocobase/database';
import { PaginationParams, SortOrder } from '../structures/pagination.dto';

export class WaBaseRepository<T> extends Repository {

  protected formatSortParams(pagination?: PaginationParams): string[] | undefined {
    if (!pagination?.sortBy) {
      return undefined;
    }

    // Convert to NocoBase sort format
    const direction = pagination.sortOrder === 'DESC' ? '-' : '';
    return [`${direction}${pagination.sortBy}`];
  }

  async find(options: FindOptions = {}) {
    // If pagination exists, format the sort parameters
    if (options['pagination']) {
      const pagination = options['pagination'] as PaginationParams;
      options.sort = this.formatSortParams(pagination);
      
      // Clean up pagination object to prevent conflicts
      delete options['pagination'];
    }

    // Call parent repository's find method with formatted options
    return super.find(options);
  }

  async findOne(options: FindOptions = {}) {
    // If pagination exists, format the sort parameters
    if (options['pagination']) {
      const pagination = options['pagination'] as PaginationParams;
      options.sort = this.formatSortParams(pagination);
      
      // Clean up pagination object to prevent conflicts
      delete options['pagination'];
    }

    // Call parent repository's findOne method with formatted options
    return super.findOne(options);
  }
  

  async getAll(pagination?: PaginationParams): Promise<T[]> {
    const options: any = {};
    
    if (pagination) {
      if (pagination.limit) {
        options.pageSize = pagination.limit;
      }
      if (pagination.offset) {
        options.page = Math.floor(pagination.offset / (pagination.limit || 10)) + 1;
      }
      if (pagination.sortBy) {
        options.sort = [`${pagination.sortBy} ${pagination.sortOrder || 'desc'}`];
      }
    }
    
    return await this.find(options);
  }

  async getById(id: string): Promise<T | null> {
    return await this.findOne({
      filter: {
        id: id
      }
    });
  }

  async deleteAll(): Promise<void> {
    await this.destroy({
      filter: {}
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.destroy({
      filter: {
        id: id
      }
    });
  }

  async save(data: T): Promise<void> {
    if ('id' in data) {
      await this.update({
        filter: {
          id: (data as any).id
        },
        values: data
      });
    } else {
      await this.create({
        values: data
      });
    }
  }
}