// server/collections/wa.messages.ts
export default {
  name: 'wa_messages',
  fields: [
    {
      type: 'string',
      name: 'id',
      primaryKey: true
    },
    {
      type: 'string',
      name: 'remoteJid'
    },
    {
      type: 'json',
      name: 'data'
    },
    {
      type: 'integer',
      name: 'messageTimestamp'
    },
    {
      type: 'string',
      name: 'pushName'
    },
    {
      type: 'json',
      name: 'message'
    },
    {
      type: 'string',
      name: 'messageType'
    },
    {
      type: 'json',
      name: 'key'
    },
    {
      type: 'belongsTo',
      name: 'chat',
      target: 'wa_chats',
      foreignKey: 'remoteJid',
      targetKey: 'id'
    }
  ]
};