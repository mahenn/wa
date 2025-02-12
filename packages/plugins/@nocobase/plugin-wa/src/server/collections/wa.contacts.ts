import { defineCollection } from '@nocobase/database';

export default defineCollection({
  origin: '@nocobase/plugin-wa',
  name: 'wa_contacts',
  title: '{{t("WhatsApp Contacts")}}',
  fields: [
    {
      name: 'id',
      type: 'string',
      primaryKey: true,
      uiSchema: {
        type: 'string',
        title: '{{t("Contact ID")}}',
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
        title: '{{t("Contact Data")}}',
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
        title: '{{t("Name")}}',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    },
    {
      interface: 'input',
      type: 'string',
      name: 'notify',
      uiSchema: {
        type: 'string',
        title: '{{t("Notify Name")}}',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    },
    {
      interface: 'input',
      type: 'string',
      name: 'verifiedName',
      uiSchema: {
        type: 'string',
        title: '{{t("Verified Name")}}',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    },
    {
      interface: 'input',
      type: 'string',
      name: 'imgUrl',
      uiSchema: {
        type: 'string',
        title: '{{t("Profile Picture")}}',
        'x-component': 'Avatar',
        'x-read-pretty': true
      }
    },
    {
      interface: 'input',
      type: 'string',
      name: 'status',
      uiSchema: {
        type: 'string',
        title: '{{t("Status")}}',
        'x-component': 'Input',
        'x-read-pretty': true
      }
    }
  ]
});