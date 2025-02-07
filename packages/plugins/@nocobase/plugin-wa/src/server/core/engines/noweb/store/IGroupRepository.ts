//engines/noweb/store/IGroupRepository.ts
import { GroupMetadata } from '@adiwajshing/baileys/src';
import { PaginationParams } from '../../../../structures/pagination.dto';

export interface IGroupRepository {
  getAll(pagination?: PaginationParams): Promise<GroupMetadata[]>;

  getById(id: string): Promise<GroupMetadata | null>;

  deleteAll(): Promise<void>;

  deleteById(id: string): Promise<void>;

  save(group: GroupMetadata): Promise<void>;
}