import { WAMessage } from '@adiwajshing/baileys/src';
import { LabelAssociation } from '@adiwajshing/baileys/src/Types/LabelAssociation';
import { ILabelAssociationRepository } from '../ILabelAssociationsRepository';
import { Sqlite3GroupRepository } from './Sqlite3GroupRepository';
import { ILabelsRepository } from '../ILabelsRepository';
import { Sqlite3LabelAssociationsRepository } from './Sqlite3LabelAssociationsRepository';
import { Sqlite3LabelsRepository } from './Sqlite3LabelsRepository';
import { Field, Index, Schema } from '../../../../storage/sqlite3/Schema';
import { NOWEB_STORE_SCHEMA } from '../Schema';
import { INowebStorage } from '../INowebStorage';
import { Sqlite3ChatRepository } from './Sqlite3ChatRepository';
import { Sqlite3ContactRepository } from './Sqlite3ContactRepository';
import { Sqlite3MessagesRepository } from './Sqlite3MessagesRepository';
import { Sqlite3SchemaValidation } from './Sqlite3SchemaValidation';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Database = require('better-sqlite3');

export class Sqlite3Storage extends INowebStorage {
  private readonly db: any;
  private readonly tables: Schema[];

  constructor(filePath: string) {
    super();
    this.db = new Database('./my-database.db');
    console.log("db file path is ",filePath);
    this.tables = NOWEB_STORE_SCHEMA;
  }

  async init() {
    this.db.pragma('journal_mode = WAL;');
    this.migrate();
    this.validateSchema();
  }

  private migrate() {
    this.migration0001init();
  }

  private validateSchema() {
    for (const table of this.tables) {
      new Sqlite3SchemaValidation(table, this.db).validate();
    }
  }

  private migration0001init() {
    // Contacts
    this.db.exec(
      'CREATE TABLE IF NOT EXISTS contacts (id TEXT PRIMARY KEY, data TEXT)',
    );
    this.db.exec(
      'CREATE UNIQUE INDEX IF NOT EXISTS contacts_id_index ON contacts (id)',
    );

    // Chats
    this.db.exec(
      'CREATE TABLE IF NOT EXISTS chats (id TEXT PRIMARY KEY, conversationTimestamp INTEGER, data TEXT)',
    );
    this.db.exec(
      'CREATE UNIQUE INDEX IF NOT EXISTS chats_id_index ON chats (id)',
    );
    this.db.exec(
      'CREATE INDEX IF NOT EXISTS chats_conversationTimestamp_index ON chats (conversationTimestamp)',
    );
     // Groups
    this.db.exec(
      'CREATE TABLE IF NOT EXISTS groups (id TEXT PRIMARY KEY, data TEXT)',
    );
    this.db.exec(
      'CREATE UNIQUE INDEX IF NOT EXISTS groups_id_index ON groups (id)',
    );

    // Messages
    this.db.exec(
      'CREATE TABLE IF NOT EXISTS messages (jid TEXT, id TEXT, messageTimestamp INTEGER, data TEXT)',
    );
    this.db.exec(
      'CREATE UNIQUE INDEX IF NOT EXISTS messages_id_index ON messages (id)',
    );
    this.db.exec(
      'CREATE INDEX IF NOT EXISTS messages_jid_id_index ON messages (jid, id)',
    );
    this.db.exec(
      'CREATE INDEX IF NOT EXISTS messages_jid_timestamp_index ON messages (jid, messageTimestamp)',
    );
    this.db.exec(
      'CREATE INDEX IF NOT EXISTS timestamp_index ON messages (messageTimestamp)',
    );

    //
    // Labels
    //
    this.db.exec(
      'CREATE TABLE IF NOT EXISTS labels (id TEXT PRIMARY KEY, data TEXT)',
    );
    this.db.exec(
      'CREATE UNIQUE INDEX IF NOT EXISTS labels_id_index ON labels (id)',
    );

    // Label associations
    this.db.exec(
      'CREATE TABLE IF NOT EXISTS labelAssociations (id TEXT PRIMARY KEY, type TEXT, labelId TEXT, chatId TEXT, messageId TEXT, data TEXT)',
    );
    this.db.exec(
      'CREATE UNIQUE INDEX IF NOT EXISTS label_assoc_id_index ON labelAssociations (id)',
    );
    this.db.exec(
      'CREATE INDEX IF NOT EXISTS label_assoc_type_label_index ON labelAssociations (type, labelId)',
    );
    this.db.exec(
      'CREATE INDEX IF NOT EXISTS label_assoc_type_chat_index ON labelAssociations (type, chatId)',
    );
    this.db.exec(
      'CREATE INDEX IF NOT EXISTS label_assoc_type_message_index ON labelAssociations (type, messageId)',
    );
  }

  async close() {
    this.db.close();
  }

  getContactsRepository() {
    return new Sqlite3ContactRepository(this.db, this.getSchema('contacts'));
  }

  getChatRepository() {
    return new Sqlite3ChatRepository(this.db, this.getSchema('chats'));
  }

  getGroupRepository() {
    return new Sqlite3GroupRepository(this.db, this.getSchema('groups'));
  }

  getLabelsRepository(): ILabelsRepository {
    return new Sqlite3LabelsRepository(this.db, this.getSchema('labels'));
  }

  getLabelAssociationRepository(): ILabelAssociationRepository {
    const metadata = this.getLabelAssociationMetadata();
    return new Sqlite3LabelAssociationsRepository(
      this.db,
      this.getSchema('labelAssociations'),
      metadata,
    );
  }

  getMessagesRepository() {
    const metadata = this.getMessagesMetadata();
    return new Sqlite3MessagesRepository(
      this.db,
      this.getSchema('messages'),
      metadata,
    );
  }

  getSchema(name: string) {
    const schema = this.tables.find((table) => table.name === name);
    if (!schema) {
      throw new Error(`Schema not found: ${name}`);
    }
    return schema;
  }
}
