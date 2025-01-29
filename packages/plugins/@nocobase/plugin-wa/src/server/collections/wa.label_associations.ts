//  server/collections/wa.label_associations.ts
export default {
  name: 'wa_label_associations',
  fields: [
    {
      type: 'string',
      name: 'id',
      primaryKey: true
    },
    {
      type: 'string',
      name: 'labelId'
    },
    {
      type: 'string',
      name: 'chatId'
    },
    {
      type: 'string',
      name: 'type'
    }
  ]
};