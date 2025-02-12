//WhatsAppBlockInitializer.tsx
/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { TableOutlined } from '@ant-design/icons';
import React, { FC } from 'react';

import { SchemaInitializerItem, useSchemaInitializer, useSchemaInitializerItem } from '@nocobase/client';
import {WhatsAppBlockSettings} from './WhatsAppBlockSettings';

export const WhatsAppBlockInitializer: FC<any> = () => {
  const itemConfig = useSchemaInitializerItem();
  const { insert } = useSchemaInitializer();

  return (
    <SchemaInitializerItem
      icon={<TableOutlined />}
      {...itemConfig}
      onClick={() => {
        insert({
          type: 'void',
          // 'x-decorator': 'CardItem',
          // 'x-decorator-props': {},
           'x-component': 'CardItem',
          'x-settings': WhatsAppBlockSettings, // Using our custom settings component
          properties: {
            wablock: {
              type: 'void',
              'x-component': 'WhatsAppSession',
            },
          },
        });
      }}
    />
  );
};
