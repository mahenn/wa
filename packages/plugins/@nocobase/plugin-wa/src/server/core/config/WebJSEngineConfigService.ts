//config/WebJSEngineConfigService.ts
//import { ConfigService } from '@nestjs/config';

//import { WebJSConfig } from '../../core/engines/webjs/session.webjs.core';


export class  WebJSEngineConfigService {
  constructor() {}

  getConfig() {
    let webVersion = process.env.WAHA_WEBJS_WEB_VERSION || undefined;

    if (webVersion === '2.2412.54-videofix') {
      // Deprecated version
      webVersion = undefined;
    }
    return {
      webVersion: webVersion,
      cacheType: this.getCacheType(),
    };
  }

  getCacheType(): 'local' | 'none' {
    const cacheType = process.env.WAHA_WEBJS_CACHE_TYPE || 'none'
      .toLowerCase();
    if (cacheType != 'local' && cacheType != 'none') {
      throw new Error(
        'Invalid cache type, only "local" and "none" are allowed',
      );
    }

    return cacheType;
  }
}