import { defineCollection } from '@nocobase/database';

export default defineCollection({
  origin: '@nocobase/plugin-wa',
  name: 'wa_groups',
  title: '{{t("WhatsApp Groups")}}',
  fields: [
    {
      name: 'id',
      type: 'string',
      primaryKey: true,
      uiSchema: {
        type: 'string',
        title: '{{t("Group ID")}}',
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
        title: '{{t("Group Data")}}',
        'x-component': 'Input.JSON',
        'x-read-pretty': true
      }
    },
    {
      interface: 'input',
      type: 'string',
      name: 'subject',
      uiSchema: {
        type: 'string',
        title: '{{t("Group Name")}}',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    },
    {
      interface: 'json',
      type: 'json',
      name: 'participants',
      uiSchema: {
        type: 'json',
        title: '{{t("Participants")}}',
        'x-component': 'Input.JSON',
        'x-read-pretty': true
      }
    },
    {
      interface: 'input',
      type: 'string',
      name: 'owner',
      uiSchema: {
        type: 'string',
        title: '{{t("Owner")}}',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    },
    {
      interface: 'textarea',
      type: 'string',
      name: 'desc',
      uiSchema: {
        type: 'string',
        title: '{{t("Description")}}',
        'x-component': 'Input.TextArea',
        'x-read-pretty': true
      }
    },
    {
      interface: 'integer',
      type: 'integer',
      name: 'size',
      uiSchema: {
        type: 'number',
        title: '{{t("Size")}}',
        'x-component': 'InputNumber',
        'x-read-pretty': true
      }
    }
  ]
});