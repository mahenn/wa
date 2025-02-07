//sqlite3/Sqlite3GroupRepository.ts
import { GroupMetadata } from '@adiwajshing/baileys/src/Types/GroupMetadata';
import { IGroupRepository } from '../IGroupRepository';
import { KnexPaginator } from '../../../../../utils/Paginator';

import { NOWEBSqlite3KVRepository } from './NOWEBSqlite3KVRepository';

class Paginator extends KnexPaginator {
  indexes = ['id'];
}

export class Sqlite3GroupRepository
  extends NOWEBSqlite3KVRepository<GroupMetadata>
  implements IGroupRepository
{
  protected Paginator = Paginator;
}