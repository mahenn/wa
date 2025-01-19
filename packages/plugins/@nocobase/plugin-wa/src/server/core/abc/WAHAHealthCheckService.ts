import { createLogger,Logger } from '@nocobase/logger';

import { WhatsappConfigService } from '../../config.service';
import { SessionManager } from './manager.abc';


export abstract class WAHAHealthCheckService {
  protected logger;
  constructor(
    protected sessionManager: SessionManager,
    protected health,
    protected config: WhatsappConfigService,
  ) {
    this.logger =  createLogger({name:'WAHAHealthCheckService',transports: ['console']});
  }

  abstract check(): Promise<any>;
}
