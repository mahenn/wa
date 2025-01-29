//engines/noweb/store/sqlite3/NOWEBSqlite3KVRepository.ts
import { BufferJSON } from '@adiwajshing/baileys/src/Utils';
import {
  convertProtobufToPlainObject,
  replaceLongsWithNumber,
} from '../../utils';
import { Sqlite3KVRepository } from '../../../../storage/sqlite3/Sqlite3KVRepository';

/**
 * Key value repository with extra metadata
 * Add support for converting protobuf to plain object
 */
export class NOWEBSqlite3KVRepository<
  Entity,
> extends Sqlite3KVRepository<Entity> {
  protected stringify(data: any): string {
    return JSON.stringify(data, BufferJSON.replacer);
  }

  protected parse(row: any): any {
    return JSON.parse(row.data, BufferJSON.reviver);
  }

  protected dump(entity: Entity) {
    const raw = convertProtobufToPlainObject(entity);
    replaceLongsWithNumber(raw);
    return super.dump(raw);
  }
}