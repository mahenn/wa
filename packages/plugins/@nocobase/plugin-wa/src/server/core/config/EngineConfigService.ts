import { createLogger,Logger,LoggerOptions } from '@nocobase/logger';
import { parseBool } from '../../helpers';
import { WAHAEngine } from '../../structures/enums.dto';
import { getEngineName } from '../../version';


export class EngineConfigService {
  private logger: Logger;

  constructor() {
    this.logger =  createLogger({
      name: 'EngineConfigService',
      transports: ['console'],
      level: 'info'
    } as LoggerOptions);
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
}
