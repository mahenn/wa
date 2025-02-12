// src/client/WhatsAppBlockSettings.tsx
// import { SchemaSettings } from '@nocobase/client';
// import React from 'react';

// export const WhatsAppBlockSettings = () => {
//   return (
//     <SchemaSettings title={'WhatsApp Block Settings'}>
//       <SchemaSettings.Remove
//         removeParentsIfNoChildren
//         breakRemoveOn={{
//           'x-component': 'Grid',
//         }}
//       />
//     </SchemaSettings>
//   );
// };

// src/client/settings/index.ts
import { ISchema, useField, useFieldSchema } from '@formily/react';
import {
  FilterBlockType,
  useBlockAssociationContext,
  SchemaSettings,
  SchemaSettingsBlockHeightItem,
  SchemaSettingsBlockTitleItem,
  SchemaSettingsCascaderItem,
  SchemaSettingsDataScope,
  SchemaSettingsSelectItem,
  SchemaSettingsSwitchItem,
  SchemaSettingsTemplate,
  removeNullCondition,
  useBlockTemplateContext,
  useCollection,
  useCollectionManager_deprecated,
  useDesignable,
  useFormBlockContext,
  SchemaSettingsConnectDataBlocks,
  SchemaSettingsDefaultSortingRules

} from '@nocobase/client';

import { useTranslation } from 'react-i18next';

export const WhatsAppBlockSettings = new SchemaSettings ({
  name: 'whatsappsettings',
  items: [
    {
      name: 'title',
      Component: SchemaSettingsBlockTitleItem,
    },
    {
      name: 'setTheBlockHeight',
      Component: SchemaSettingsBlockHeightItem,
    },
    {
      name: 'remove',
      type: 'remove',
      componentProps: {
        removeParentsIfNoChildren: true,
        breakRemoveOn: {
          'x-component': 'Grid',
        },
      },
    },
  ],
});


