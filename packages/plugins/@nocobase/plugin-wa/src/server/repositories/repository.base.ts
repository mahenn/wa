import { Repository } from '@nocobase/database';
import { PaginationParams, SortOrder } from '../structures/pagination.dto';

interface FindOptions {
  filter?: Record<string, any>;
  pagination?: PaginationParams;
  sort?: string[];
  limit?: number;
  offset?: number;
}

export class WaBaseRepository<T extends object> extends Repository {

  protected formatSortParams(pagination?: PaginationParams): string[] | undefined {
    if (!pagination?.sortBy) {
      return undefined;
    }
    // Convert to NocoBase sort format
    const direction = pagination.sortOrder === 'desc' ? '-' : '';
    return [`${direction}${pagination.sortBy}`];
  }

  async find(options: FindOptions = {}) {
    // If pagination exists, format the sort parameters
    if (options['pagination']) {
      const pagination = options['pagination'] as PaginationParams;
      options.sort = this.formatSortParams(pagination);
      options.limit = pagination.limit;
      options.offset = pagination.offset;
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
      options.limit = pagination.limit;
      options.offset = pagination.offset;
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

  protected async saveEntity(
    entity: T, 
    id: string,
    getEntityData: (entity: T) => Record<string, any>
  ): Promise<void> {
    try {
      const existing = await this.findOne({
        filter: { id }
      });

      const entityData = getEntityData(entity);
      
      // Remove null/undefined values for updates
      const cleanData = Object.entries(entityData).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      if (existing) {
        // Merge with existing data for updates
        const mergedData = {
          ...existing.data,
          ...cleanData
        };

        await this.update({
          filter: { id },
          values: mergedData
        });
      } else {
        await this.create({
          values: entityData
        });
      }
    } catch (error) {
      console.error(`Error saving entity:`, error);
      throw error;
    }
  }
}