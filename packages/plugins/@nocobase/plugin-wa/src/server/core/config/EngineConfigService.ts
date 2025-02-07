import { Logger } from '@nestjs/common';

//import { createLogger,Logger,LoggerOptions } from '@nocobase/logger';
import { parseBool } from '../../helpers';
import { WAHAEngine } from '../../structures/enums.dto';
import { getEngineName } from '../../version';
import Database from '@nocobase/server';

export class EngineConfigService {
  private logger: Logger;
 

  constructor(private db) {
    // this.logger =  createLogger({
    //   name: 'EngineConfigService',
    //   transports: ['console'],
    //   level: 'info'
    // } as LoggerOptions);

    this.logger = new Logger('EngineConfigService');
    this.db = db;
  }

  

  getDefaultEngineName(): WAHAEngine {
    const value = getEngineName();
    if (value in WAHAEngine) {
      return WAHAEngine[value];
    }
    this.logger.warn(
      `Unknown WhatsApp default engine WHATSAPP_DEFAULT_ENGINE=${value}. Using WEBJS`,
    );
    return WAHAEngine.WEBJS;
  }

  get shouldPrintQR(): boolean {
    const value = process.env.WAHA_PRINT_QR || true;
    return parseBool(value);
  }

  get database(): Database {
    return this.db;
  }
}
