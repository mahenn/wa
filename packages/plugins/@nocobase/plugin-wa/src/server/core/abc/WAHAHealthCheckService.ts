import { createLogger,Logger,LoggerOptions } from '@nocobase/logger';

import { WhatsappConfigService } from '../../config.service';
import { SessionManager } from './manager.abc';


export abstract class WAHAHealthCheckService {
  protected logger;
  constructor(
    protected sessionManager: SessionManager,
    protected health,
    protected config: WhatsappConfigService,
  ) {
      this.logger =  createLogger({
        name:'WAHAHealthCheckService',
        transports: ['console'],
        level: 'info'
      } as LoggerOptions);
    }

  abstract check(): Promise<any>;
}
