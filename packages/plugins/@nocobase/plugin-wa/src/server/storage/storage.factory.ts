// server/storage/wa.storage.factory.ts
import { Database } from '@nocobase/database';
import { INowebStorage } from '../interfaces/storage';
import { WaMySQLStorage } from './storage.mysql';

export class WaStorageFactory {
  static createStorage(db: Database): INowebStorage {
    return new WaMySQLStorage(db);
  }
}