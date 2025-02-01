// server/collections/wa.chats.ts
export default {
  name: 'wa_chats',
  fields: [
    {
      type: 'string',
      name: 'id',
      primaryKey: true
    },
    {
      type: 'json',
      name: 'data'
    },
    {
      type: 'integer',
      name: 'conversationTimestamp'
    },
    {
      type: 'integer', 
      name: 'unreadCount'
    },
    {
      type: 'string',
      name: 'name'
    },
    {
      type: 'boolean',
      name: 'pinned'
    },
    {
      type: 'boolean',
      name: 'archived'
    },
    {
      type: 'boolean',
      name: 'isGroup'
    },
    {
      type: 'boolean',
      name: 'isBroadcast'
    },
    {
      type: 'hasMany',
      name: 'messages',
      target: 'wa_messages',
      foreignKey: 'remoteJid',
      sourceKey: 'id'
    }
  ],
  relations: [
    {
      type: 'hasMany',
      name: 'messages',
      target: 'wa_messages',
      foreignKey: 'remoteJid',
      sourceKey: 'id'
    }
  ]
};