// server/collections/wa.labels.ts
export default {
  name: 'wa_labels',
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
      name: 'name'
    },
    {
      type: 'string',
      name: 'color'
    },
    {
      type: 'integer',
      name: 'predefinedId'
    }
  ]
};