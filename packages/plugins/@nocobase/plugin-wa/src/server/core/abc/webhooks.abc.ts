import { LoggerBuilder } from '../../utils/logging';
//import { createLogger,Logger,LoggerOptions } from '@nocobase/logger';
import { WebhookConfig } from '../../structures/webhooks.config.dto';
import { WhatsappSession } from './session.abc';
import { Logger } from 'pino';

export abstract class WebhookSender {
  protected url: string;
  protected logger: Logger;

  constructor(
    loggerBuilder: LoggerBuilder,
    protected webhookConfig: WebhookConfig,
  ) {
    this.url = webhookConfig.url;
    this.logger = loggerBuilder.child({ name: WebhookSender.name });
    // this.logger = createLogger({
    //   name: WebhookSender.name ,
    //   transport: 'console',
    //   level: 'info'
    // } as LoggerOptions);
  }

  abstract send(json);
}

export abstract class WebhookConductor {
  abstract configure(session: WhatsappSession, webhooks: WebhookConfig[]);
}
