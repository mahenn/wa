import { defineCollection } from '@nocobase/database';

export default defineCollection({
  origin: '@nocobase/plugin-wa',
  name: 'wa_label_associations',
  title: '{{t("WhatsApp Label Associations")}}',
  fields: [
    {
      name: 'id',
      type: 'string',
      primaryKey: true,
      uiSchema: {
        type: 'string',
        title: '{{t("Association ID")}}',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    },
    {
      interface: 'input',
      type: 'string',
      name: 'labelId',
      uiSchema: {
        type: 'string',
        title: '{{t("Label ID")}}',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    },
    {
      interface: 'input',
      type: 'string',
      name: 'chatId',
      uiSchema: {
        type: 'string',
        title: '{{t("Chat ID")}}',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    },
    {
      interface: 'select',
      type: 'string',
      name: 'type',
      uiSchema: {
        type: 'string',
        title: '{{t("Association Type")}}',
        'x-component': 'Select',
        'x-component-props': {
          options: [
            { value: 'chat', label: '{{t("Chat")}}' },
            { value: 'message', label: '{{t("Message")}}' }
          ]
        },
        'x-read-pretty': true
      }
    }
  ],
  
  relations: [
    {
      type: 'belongsTo',
      name: 'label',
      target: 'wa_labels',
      foreignKey: 'labelId',
      targetKey: 'id'
    },
    {
      type: 'belongsTo',
      name: 'chat',
      target: 'wa_chats',
      foreignKey: 'chatId',
      targetKey: 'id'
    }
  ]
});