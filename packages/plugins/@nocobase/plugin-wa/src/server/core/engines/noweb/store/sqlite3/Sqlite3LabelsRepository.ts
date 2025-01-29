import { Label } from '@adiwajshing/baileys/src/Types/Label';
import { ILabelsRepository } from '../ILabelsRepository';

import { NOWEBSqlite3KVRepository } from './NOWEBSqlite3KVRepository';

export class Sqlite3LabelsRepository
  extends NOWEBSqlite3KVRepository<Label>
  implements ILabelsRepository {}
