// server/collections/wa.groups.ts
export default {
  name: 'wa_groups',
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
      type: 'string',
      name: 'subject'
    },
    {
      type: 'json',
      name: 'participants'
    },
    {
      type: 'string',
      name: 'owner'
    },
    {
      type: 'string',
      name: 'desc'
    },
    {
      type: 'integer',
      name: 'size'
    }
  ]
};