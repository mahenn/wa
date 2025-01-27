import { Label } from '@adiwajshing/baileys/src/Types/Label';
import { ILabelsRepository } from '../ILabelsRepository';

import { Sqlite3KVRepository } from './Sqlite3KVRepository';

export class Sqlite3LabelsRepository
  extends Sqlite3KVRepository<Label>
  implements ILabelsRepository {}
