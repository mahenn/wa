import { Plugin } from '@nocobase/client';
import WhatsAppSessionManager from './views/WhatsAppSessionManager';
import WhatsAppSession from './views/WhatsAppSession';
import WhatsAppQRCode from './views/WhatsAppQRCode';
import WhatsAppQRCodeModal from './views/WhatsAppQRCodeModal';
import { tval } from '@nocobase/utils/client';
import React from 'react';

export class PluginWhatsAppClient extends Plugin {
  async load() {
    // Add a new route for the WhatsApp session page
    this.router.add('whatsapp', {
      path: '/whatsapp',
      Component: WhatsAppSession, // Register the WhatsApp session component for this route
    });

    this.router.add('ping', {
      path: '/ping',
      Component: () => <div>Configure WhatsApp Plugin settings here</div>, // Register the WhatsApp session component for this route
    });


    this.app.pluginSettingsManager.add('whatsapp', {
      title: tval('Whatsapp', { ns: 'Whatsapp' }),
      icon: 'ClusterOutlined',
      Component: WhatsAppSessionManager,
    })

    // Add a settings page for the plugin in the settings menu
    // this.app.pluginSettingsManager.add('whatsapp-plugin-settings', {
    //   title: 'WhatsApp Plugin Settings',
    //   icon: 'ApiOutlined', // Use an icon for the settings page
    //   Component: () => <div>Configure WhatsApp Plugin settings here</div>, // Settings page component
    // });
  }
}

export default PluginWhatsAppClient;