import { defineCollection } from '@nocobase/database';

export default defineCollection({
  origin: '@nocobase/plugin-wa',
  name: 'wa_chats',
  createdBy: true,
  updatedBy: true,
  title: '{{t("WhatsApp Chats")}}',
  sortable: 'conversationTimestamp',
  fields: [
    {
      name: 'id',
      type: 'string',
      primaryKey: true,
      allowNull: false,
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
        title: '{{t("Chat Data")}}',
        'x-component': 'Input.JSON',
        'x-read-pretty': true
      }
    },
    {
      interface: 'input',
      type: 'string',
      name: 'name',
      uiSchema: {
        type: 'string',
        title: '{{t("Contact Name")}}',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    },
    {
      interface: 'datetime',
      type: 'integer',
      name: 'conversationTimestamp',
      uiSchema: {
        type: 'datetime',
        title: '{{t("Last Message Time")}}',
        'x-component': 'DatePicker',
        'x-component-props': {
          showTime: true,
          format: 'YYYY-MM-DD HH:mm:ss'
        },
        'x-read-pretty': true
      }
    },
    {
      interface: 'number',
      type: 'integer',
      name: 'unreadCount',
      uiSchema: {
        type: 'number',
        title: '{{t("Unread Messages")}}',
        'x-component': 'InputNumber',
        'x-read-pretty': true
      }
    },
    {
      interface: 'checkbox',
      type: 'boolean',
      name: 'pinned',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Pinned")}}',
        'x-component': 'Checkbox',
        'x-read-pretty': true
      }
    },
    {
      interface: 'checkbox',
      type: 'boolean',
      name: 'archived',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Archived")}}',
        'x-component': 'Checkbox',
        'x-read-pretty': true
      }
    },
    {
      interface: 'checkbox',
      type: 'boolean',
      name: 'isGroup',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Group Chat")}}',
        'x-component': 'Checkbox',
        'x-read-pretty': true
      }
    },
    {
      interface: 'checkbox',
      type: 'boolean',
      name: 'isBroadcast',
      defaultValue: false,
      uiSchema: {
        type: 'boolean',
        title: '{{t("Broadcast")}}',
        'x-component': 'Checkbox',
        'x-read-pretty': true
      }
    },
    {
      type: 'hasMany',
      name: 'messages',
      target: 'wa_messages',
      foreignKey: 'remoteJid',
      sourceKey: 'id',
      uiSchema: {
        type: 'array',
        title: '{{t("Messages")}}',
        'x-component': 'TableField',
        'x-component-props': {
          pagination: true,
          scroll: { x: 1000 }
        }
      }
    }
  ],
  
  filterTargetKey: 'id',
  shared: true,
  logging: true,
  
  relations: [
    {
      type: 'hasMany',
      name: 'messages',
      target: 'wa_messages',
      foreignKey: 'remoteJid',
      sourceKey: 'id'
    }
  ]
});