// server/collections/wa.contacts.ts
export default {
  name: 'wa_contacts',
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
      name: 'notify'
    },
    {
      type: 'string',
      name: 'verifiedName'
    },
    {
      type: 'string',
      name: 'imgUrl'
    },
    {
      type: 'string',
      name: 'status'
    }
  ]
};