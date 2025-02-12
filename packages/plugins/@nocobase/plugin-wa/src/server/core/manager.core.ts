import {
  LogLevel,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';


import { WebJSEngineConfigService } from './config/WebJSEngineConfigService';
//import { WebhookConductor } from '@waha/core/integrations/webhooks/WebhookConductor';
import { MediaStorageFactory } from './media/MediaStorageFactory';
import { DefaultMap } from '../utils/DefaultMap';

//import { MediaNoopStorage } from './media/MediaNoopStorage';
import { getPinoLogLevel, LoggerBuilder } from '../utils/logging';
import { promiseTimeout, sleep } from '../utils/promiseTimeout';
import { complete } from '../utils/reactive/complete';
import { SwitchObservable } from '../utils/reactive/SwitchObservable';


import { PinoLogger } from 'nestjs-pino';

import { Observable, retry, share } from 'rxjs';
import { map } from 'rxjs/operators';

import { WhatsappConfigService } from '../config.service';
import {
  WAHAEngine,
  WAHAEvents,
  WAHASessionStatus,
} from '../structures/enums.dto';
import {
  ProxyConfig,
  SessionConfig,
  SessionDetailedInfo,
  SessionDTO,
  SessionInfo,
} from '../structures/sessions.dto';
import { WebhookConfig } from '../structures/webhooks.config.dto';
import { populateSessionInfo, SessionManager } from './abc/manager.abc';
import { SessionParams, WhatsappSession } from './abc/session.abc';
import { EngineConfigService } from './config/EngineConfigService';
import { WhatsappSessionNoWebCore } from './engines/noweb/session.noweb.core';
//import { WhatsappSessionWebJSCore } from './engines/webjs/session.webjs.core';
import { DOCS_URL } from './exceptions';
import { getProxyConfig } from './helpers.proxy';
import { MediaManager } from './media/MediaManager';
import { LocalSessionAuthRepository } from './storage/LocalSessionAuthRepository';
import { LocalStoreCore } from './storage/LocalStoreCore';
//import { WebhookConductorCore } from './webhooks.core';

export class OnlyDefaultSessionIsAllowed extends UnprocessableEntityException {
  constructor() {
    super(
      `WAHA Core support only 'default' session. If you want to run more then one WhatsApp account - please get WAHA PLUS version. Check this out: ${DOCS_URL}`,
    );
  }
}
enum DefaultSessionStatus {
  REMOVED = undefined,
  STOPPED = null,
}

export class SessionManagerCore extends SessionManager {
  SESSION_STOP_TIMEOUT = 3000;

  // session - exists and running (or failed or smth)
  // null - stopped
  // undefined - removed
  private session: WhatsappSession | DefaultSessionStatus;
  private sessionConfig?: SessionConfig;
  DEFAULT = 'default';

  // @ts-ignore
  protected readonly EngineClass: typeof WhatsappSession;
  protected events2: DefaultMap<WAHAEvents, SwitchObservable<any>>;

  constructor(
    config: WhatsappConfigService,
    private engineConfigService: EngineConfigService,
     private webjsEngineConfigService: WebJSEngineConfigService,
    log: PinoLogger,
    private mediaStorageFactory: MediaStorageFactory,
  ) {
    //console.log("core",log);
    super(config, log);
    
    this.session = DefaultSessionStatus.STOPPED;
    this.sessionConfig = null;
    
    const engineName = this.engineConfigService.getDefaultEngineName();
    this.EngineClass = this.getEngine(engineName);
    this.events2 = new DefaultMap<WAHAEvents, SwitchObservable<any>>(
      (key) =>
        new SwitchObservable((obs$) => {
          return obs$.pipe(retry(), share());
        }),
    );

    this.store = new LocalStoreCore(engineName.toLowerCase());
    this.sessionAuthRepository = new LocalSessionAuthRepository(this.store);
    this.startPredefinedSessions();

     this.clearStorage().catch((error) => {
      this.log.error({ error }, 'Error while clearing storage');
    });
  }

  protected getEngine(engine: WAHAEngine): typeof WhatsappSession {
    // if (engine === WAHAEngine.WEBJS) {
    //   return WhatsappSessionWebJSCore;
    // } else 
    if (engine === WAHAEngine.NOWEB) {
      return WhatsappSessionNoWebCore;
    } else {
      throw new NotFoundException(`Unknown whatsapp engine '${engine}'.`);
    }
  }

  private onlyDefault(name: string) {
    if (name !== this.DEFAULT) {
      throw new OnlyDefaultSessionIsAllowed();
    }
  }

  async beforeApplicationShutdown(signal?: string) {
    this.stopEvents();
    if (!this.session) {
      return;
    }
    console.log("stoping sessions..........................")
    await this.stop(this.DEFAULT, true);
  }

  private async clearStorage() {
    const storage = this.mediaStorageFactory.build(
      this.log.logger.child({ name: 'Storage' }),
    );
    await storage.purge();
  }

  //
  // API Methods
  //
  async exists(name: string): Promise<boolean> {
    this.onlyDefault(name);
    return this.session !== DefaultSessionStatus.REMOVED;
  }

  isRunning(name: string): boolean {
    this.onlyDefault(name);
    return !!this.session;
  }

  async upsert(name: string, config?: SessionConfig): Promise<void> {
    this.onlyDefault(name);
    this.sessionConfig = config;
  }

  async start(name: string): Promise<SessionDTO> {
    this.onlyDefault(name);
    if (this.session) {
      throw new UnprocessableEntityException(
        `Session '${this.DEFAULT}' is already started.`,
      );
    }
    this.log.info(`'${name}' - starting session...`);
    
    
    const logger = this.log.logger.child({ session: name });
    logger.level = getPinoLogLevel(this.sessionConfig?.debug);
    const loggerBuilder: LoggerBuilder = logger;

    const storage = this.mediaStorageFactory.build(
      loggerBuilder.child({ name: 'Storage' }),
    );
    await storage.init();
    const mediaManager = new MediaManager(
      storage,
      this.config.mimetypes,
      loggerBuilder.child({ name: 'MediaManager' }),
    );

    //const webhook = new WebhookConductor(loggerBuilder);

    const proxyConfig = this.getProxyConfig();
    const sessionConfig: SessionParams = {
      name,
      mediaManager,
      loggerBuilder,
      printQR: this.engineConfigService.shouldPrintQR,
      sessionStore: this.store,
      proxyConfig: proxyConfig,
      sessionConfig: this.sessionConfig,
      db: this.engineConfigService.database,
    };

    //console.log("engine config here",this.engineConfigService);

    // if (this.EngineClass === WhatsappSessionWebJSCore) {
    //   sessionConfig.engineConfig = this.webjsEngineConfigService.getConfig();
    // }

    await this.sessionAuthRepository.init(name);
    // @ts-ignore
    const session = new this.EngineClass(sessionConfig);
    this.session = session;

    this.updateSession();

    // configure webhooks
    // const webhooks = this.getWebhooks();
    // webhook.configure(session, webhooks);


    // start session
    await session.start();
    logger.info('Session has been started.');
    return {
      name: session.name,
      status: session.status,
      config: session.sessionConfig,
    };
  }

  private updateSession() {
    if (!this.session) {
      return;
    }
    const session: WhatsappSession = this.session as WhatsappSession;
    for (const eventName in WAHAEvents) {
      const event = WAHAEvents[eventName];
      const stream$ = session
        .getEventObservable(event)
        .pipe(map(populateSessionInfo(event, session)));
      this.events2.get(event).switch(stream$);
    }
  }

  getSessionEvent(session: string, event: WAHAEvents): Observable<any> {
    return this.events2.get(event);
  }

  async stop(name: string, silent: boolean): Promise<void> {
    this.onlyDefault(name);
    if (!this.isRunning(name)) {
       this.log.debug({ session: name }, `Session is not running.`);
      return;
    }

    this.log.info({ session: name }, `Stopping session...`);
    try {
      const session = this.getSession(name);
      await session.stop();
    } catch (err) {
      this.log.warn(`Error while stopping session '${name}'`);
      if (!silent) {
        throw err;
      }
    }
    this.log.info(`Session has been stopped.`, { session: name });
    this.session = DefaultSessionStatus.STOPPED;
    this.updateSession();
    await sleep(this.SESSION_STOP_TIMEOUT);
  }

  async unpair(name: string) {
    if (!this.session) {
      return;
    }
    const session = this.session as WhatsappSession;

    this.log.info({ session: name }, 'Unpairing the device from account...');
    await session.unpair().catch((err) => {
      this.log.warn(`Error while unpairing from device: ${err}`);
    });
    await sleep(1000);
  }

  async logout(name: string): Promise<void> {
    this.onlyDefault(name);
    await this.sessionAuthRepository.clean(name);
  }

  async delete(name: string): Promise<void> {
    this.onlyDefault(name);
    this.session = DefaultSessionStatus.REMOVED;
    this.updateSession();
    this.sessionConfig = undefined;
  }

  /**
   * Combine per session and global webhooks
   */
  private getWebhooks() {
    let webhooks: WebhookConfig[] = [];
    if (this.sessionConfig?.webhooks) {
      webhooks = webhooks.concat(this.sessionConfig.webhooks);
    }
    const globalWebhookConfig = this.config.getWebhookConfig();
    if (globalWebhookConfig) {
      webhooks.push(globalWebhookConfig);
    }
    return webhooks;
  }

  /**
   * Get either session's or global proxy if defined
   */
  protected getProxyConfig(): ProxyConfig | undefined {
    if (this.sessionConfig?.proxy) {
      return this.sessionConfig.proxy;
    }
    if (!this.session) {
      return undefined;
    }
    const sessions = { [this.DEFAULT]: this.session as WhatsappSession };
    return getProxyConfig(this.config, sessions, this.DEFAULT);
  }

  getSession(name: string): WhatsappSession {
    this.onlyDefault(name);
    const session = this.session;
    if (!session) {
      throw new NotFoundException(
        `We didn't find a session with name '${name}'.\n` +
          `Please start it first by using POST /sessions/${name}/start request`,
      );
    }
    return session as WhatsappSession;
  }

  async getSessions(all: boolean): Promise<SessionInfo[]> {
    if (this.session === DefaultSessionStatus.STOPPED ) { //&& all @mahen
      return [
        {
          name: this.DEFAULT,
          status: WAHASessionStatus.STOPPED,
          config: this.sessionConfig,
          me: null,
        },
      ];
    }
    if (this.session === DefaultSessionStatus.REMOVED && all) {
      return [];
    }
    if (!this.session && !all) {
      return [];
    }

    const session = this.session as WhatsappSession;

    const me = session?.getSessionMeInfo();
    return [
      {
        name: session.name,
        status: session.status,
        config: session.sessionConfig,
        me: me,
      },
    ];
  }

  private async fetchEngineInfo() {
    const session = this.session as WhatsappSession;
    // Get engine info
    let engineInfo = {};
    if (session) {
      try {
        engineInfo = await promiseTimeout(1000, session.getEngineInfo());
      } catch (error) {
        this.log.warn(
          { session: session.name, error: `${error}` },
          'Error while getting engine info',
        );
      }
    }
    const engine = {
      engine: session?.engine,
      ...engineInfo,
    };
    return engine;
  }

  async getSessionInfo(name: string): Promise<SessionDetailedInfo | null> {
    if (name !== this.DEFAULT) {
      return null;
    }
    const sessions = await this.getSessions(true);
    if (sessions.length === 0) {
      return null;
    }
    const session = sessions[0];
    const engine = await this.fetchEngineInfo();
    return { ...session, engine: engine };
  }

  protected stopEvents() {
    complete(this.events2);
  }
}
