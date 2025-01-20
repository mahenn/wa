import { Plugin } from '@nocobase/server';
import { PinoLogger } from 'nestjs-pino';

import { authActions } from './actions/auth';
import { sessionsController } from './actions/sessions';
import { versionController } from './actions/version';
import { serverController } from './actions/server';

import { WhatsappConfigService } from './config.service';
import { SessionManagerCore } from './core/manager.core';
import { EngineConfigService } from './core/config/EngineConfigService';
import { MediaLocalStorageConfig } from './core/media/local/MediaLocalStorageConfig';




export class PluginWaServer extends Plugin {
  private sessionManager: SessionManagerCore;
  private configService: WhatsappConfigService;
  private engineConfig: EngineConfigService;
  public startTimestamp: number;


  async afterAdd() {}

  async beforeLoad() {
  }

  async load() {

    this.startTimestamp = Date.now();

    const Logger = new PinoLogger({
      pinoHttp: {
        level: 'info',
        name: 'WhatsAppPlugin'
      }
    });

    this.engineConfig = new EngineConfigService(this.app.config);
    this.configService = new WhatsappConfigService(this.app);
    this.sessionManager = new SessionManagerCore(this.configService,this.engineConfig,Logger);
    this.app.sessionManager = this.sessionManager;


    // Register auth actions
    this.app.resource({
      name: 'waauth',
      actions: {
        'qr': {
          resource: false,
          method: 'get',
          handler: authActions.getQR
        },
        'request-code': {
          resource: false,
          method: 'post',
          handler: authActions.requestCode
        },
        'authorize-code': {
          resource: false,
          method: 'post',
          handler: authActions.authorizeCode
        },
        'captcha': [
          {
            resource: false,
            method: 'get',
            handler: authActions.getCaptcha
          },
          {
            resource: false,
            method: 'post',
            handler: authActions.submitCaptcha
          }
        ]
      },
      middlewares: [
        // Validate session parameter
        async (ctx, next) => {
          const { session } = ctx.action.params;
          if (!session) {
            ctx.throw(400, 'Session parameter is required');
          }
          await next();
        }
      ]
    });

    this.app.resource({
      name: 'wasessions',
      actions: {
        list: {
          method: 'get',
          handler: sessionsController.list
        },
        get: {
          method: 'get',
          resourceName: ':session',
          handler: sessionsController.get
        },
        create: {
          method: 'post',
          handler: sessionsController.create
        },
        update: {
          method: 'put',
          resourceName: ':session',
          handler: sessionsController.update
        },
        destroy: {
          method: 'delete',
          resourceName: ':session',
          handler: sessionsController.destroy
        },
        start: {
          method: 'post',
          resourceName: ':session/start',
          handler: sessionsController.start
        },
        stop: {
          method: 'post',
          resourceName: ':session/stop',
          handler: sessionsController.stop
        }
      }
    });

    this.app.resource({
      name: 'waversion',
      actions: {
        get: {
          method: 'get',
          handler: versionController.get
        }
      }
    });

    this.app.resource({
      name: 'waserver',
      actions: {
        status: {
          method: 'get',
          handler: serverController.status
        },
        shutdown: {
          method: 'post',
          handler: serverController.shutdown
        },
        stopAll: {
          method: 'post',
          resourceName: 'stop-all',
          handler: serverController.stopAll
        }
      }
    });

    this.app.acl.allow('*', '*');

  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginWaServer;
