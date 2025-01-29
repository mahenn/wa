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
      type: 'string',
      name: 'message'
    },
    {
      type: 'string',
      name: 'messageType'
    },
    {
      type: 'boolean',
      name: 'key'
    }
  ]
};