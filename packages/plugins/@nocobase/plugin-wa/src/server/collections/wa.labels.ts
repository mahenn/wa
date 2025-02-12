import { defineCollection } from '@nocobase/database';

export default defineCollection({
  origin: '@nocobase/plugin-wa',
  name: 'wa_labels',
  title: '{{t("WhatsApp Labels")}}',
  fields: [
    {
      name: 'id',
      type: 'string',
      primaryKey: true,
      uiSchema: {
        type: 'string',
        title: '{{t("Label ID")}}',
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
        title: '{{t("Label Data")}}',
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
        title: '{{t("Label Name")}}',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    },
    {
      interface: 'colorPicker',
      type: 'string',
      name: 'color',
      uiSchema: {
        type: 'string',
        title: '{{t("Color")}}',
        'x-component': 'ColorPicker',
        'x-read-pretty': true
      }
    },
    {
      interface: 'integer',
      type: 'integer',
      name: 'predefinedId',
      uiSchema: {
        type: 'number',
        title: '{{t("Predefined ID")}}',
        'x-component': 'InputNumber',
        'x-read-pretty': true
      }
    }
  ]
});