import { defineCollection } from '@nocobase/database';

export default defineCollection({
  origin: '@nocobase/plugin-wa',
  name: 'wa_messages',
  title: '{{t("WhatsApp Messages")}}',
  sortable: 'messageTimestamp',
  fields: [
    {
      name: 'id',
      type: 'string',
      primaryKey: true,
      uiSchema: {
        type: 'string',
        title: '{{t("Message ID")}}',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    },
    {
      interface: 'input',
      type: 'string',
      name: 'remoteJid',
      uiSchema: {
        type: 'string',
        title: '{{t("Chat ID")}}',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    },
    {
      interface: 'json',
      type: 'json',
      name: 'data',
      uiSchema: {
        type: 'json',
        title: '{{t("Message Data")}}',
        'x-component': 'Input.JSON',
        'x-read-pretty': true
      }
    },
    {
      interface: 'datetime',
      type: 'integer',
      name: 'messageTimestamp',
      uiSchema: {
        type: 'datetime',
        title: '{{t("Timestamp")}}',
        'x-component': 'DatePicker',
        'x-component-props': {
          showTime: true,
          format: 'YYYY-MM-DD HH:mm:ss'
        },
        'x-read-pretty': true
      }
    },
    {
      interface: 'input',
      type: 'string',
      name: 'pushName',
      uiSchema: {
        type: 'string',
        title: '{{t("Sender Name")}}',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    },
    {
      interface: 'json',
      type: 'json',
      name: 'message',
      uiSchema: {
        type: 'json',
        title: '{{t("Message Content")}}',
        'x-component': 'Input.JSON',
        'x-read-pretty': true
      }
    },
    {
      interface: 'select',
      type: 'string',
      name: 'messageType',
      uiSchema: {
        type: 'string',
        title: '{{t("Message Type")}}',
        'x-component': 'Select',
        'x-component-props': {
          options: [
            { value: 'text', label: '{{t("Text")}}' },
            { value: 'image', label: '{{t("Image")}}' },
            { value: 'video', label: '{{t("Video")}}' },
            { value: 'audio', label: '{{t("Audio")}}' },
            { value: 'document', label: '{{t("Document")}}' }
          ]
        },
        'x-read-pretty': true
      }
    },
    {
      interface: 'json',
      type: 'json',
      name: 'key',
      uiSchema: {
        type: 'json',
        title: '{{t("Message Key")}}',
        'x-component': 'Input.JSON',
        'x-read-pretty': true
      }
    },
    {
      type: 'belongsTo',
      name: 'chat',
      target: 'wa_chats',
      foreignKey: 'remoteJid',
      targetKey: 'id',
      uiSchema: {
        title: '{{t("Chat")}}',
        'x-component': 'AssociationField',
        'x-component-props': {
          multiple: false
        }
      }
    }
  ]
});