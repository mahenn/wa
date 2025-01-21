import { Plugin } from '@nocobase/server';
import { PinoLogger } from 'nestjs-pino';

import { authActions } from './actions/auth';
import { channelActions } from './actions/channels';
import { chatsController } from './actions/chats';
import { chattingController } from './actions/chatting';
import { contactsController } from './actions/contacts';
import { groupsController } from './actions/groups';
import { labelsController } from './actions/labels';
import { presenceController } from './actions/presence';
import { screenshotController } from './actions/screenshot';
import { serverController } from './actions/server';
import { sessionsController } from './actions/sessions';
import { statusController } from './actions/status';
import { versionController } from './actions/version';

import { WhatsappConfigService } from './config.service';
import { SessionManagerCore } from './core/manager.core';
import { EngineConfigService } from './core/config/EngineConfigService';
import { MediaLocalStorageConfig } from './core/media/local/MediaLocalStorageConfig';

import { sessionMiddleware } from './middlewares/session';

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
        'version': {
          resource: false,
          method: 'get',
          handler: serverController.getVersion
        },
        'environment': {
          resource: false,
          method: 'get',
          handler: serverController.getEnvironment
        },
        'status': {
          resource: false,
          method: 'get',
          handler: serverController.getStatus
        },
        'stop': {
          resource: false,
          method: 'post',
          handler: serverController.stopServer
        }
      }
    });

    // Channel actions
    

    this.app.resource({
      name: 'wachannels',
      middlewares: [sessionMiddleware],
      actions: {
        'list': {
          resource: false,
          method: 'get',
          handler: channelActions.list
        },
        'create': {
          resource: false,
          method: 'post',
          handler: channelActions.create
        },
        'delete': {
          resource: false,
          method: 'delete',
          params: ':id',
          handler: channelActions.delete
        },
        'get': {
          resource: false,
          method: 'get',
          params: ':id',
          handler: channelActions.get
        },
        'follow': {
          resource: false,
          method: 'post',
          params: ':id/follow',
          handler: channelActions.follow
        },
        'unfollow': {
          resource: false,
          method: 'post',
          params: ':id/unfollow',
          handler: channelActions.unfollow
        },
        'mute': {
          resource: false,
          method: 'post',
          params: ':id/mute',
          handler: channelActions.mute
        },
        'unmute': {
          resource: false,
          method: 'post',
          params: ':id/unmute',
          handler: channelActions.unmute
        }
      }
    });

    this.app.resource({
      name: 'chats',
      middlewares: [sessionMiddleware],
      actions: {
        getChats: {
          method: 'get',
          handler: chatsController.getChats
        },
        deleteChat: {
          method: 'delete',
          resourceName: ':chatId',
          handler: chatsController.deleteChat
        },
        getChatMessages: {
          method: 'get',
          resourceName: ':chatId/messages',
          handler: chatsController.getChatMessages
        },
        clearMessages: {
          method: 'delete',
          resourceName: ':chatId/messages',
          handler: chatsController.clearMessages
        },
        deleteMessage: {
          method: 'delete',
          resourceName: ':chatId/messages/:messageId',
          handler: chatsController.deleteMessage
        },
        editMessage: {
          method: 'put',
          resourceName: ':chatId/messages/:messageId',
          handler: chatsController.editMessage
        },
        archiveChat: {
          method: 'post',
          resourceName: ':chatId/archive',
          handler: chatsController.archiveChat
        },
        unarchiveChat: {
          method: 'post',
          resourceName: ':chatId/unarchive',
          handler: chatsController.unarchiveChat
        }
      }
    });



    this.app.resource({
      name: 'wachat',
      middlewares: [sessionMiddleware],
      actions: {
        sendText: {
          method: 'post',
          handler: chattingController.sendText
        },
        sendImage: {
          method: 'post',
          handler: chattingController.sendImage
        },
        sendFile: {
          method: 'post',
          handler: chattingController.sendFile
        },
        sendVoice: {
          method: 'post',
          handler: chattingController.sendVoice
        },
        sendVideo: {
          method: 'post',
          handler: chattingController.sendVideo
        },
        sendSeen: {
          method: 'post',
          handler: chattingController.sendSeen
        },
        setReaction: {
          method: 'put',
          handler: chattingController.setReaction
        }
      }
    });


    this.app.resource({
      name: 'wacontacts',
      middlewares: [sessionMiddleware],
      actions: {
        list: {
          method: 'get',
          handler: contactsController.getAll
        },
        get: {
          method: 'get',
          resourceName: ':contactId',
          handler: contactsController.get
        },
        checkExists: {
          method: 'get',
          resourceName: 'check-exists',
          handler: contactsController.checkExists
        },
        getAbout: {
          method: 'get',
          resourceName: ':contactId/about',
          handler: contactsController.getAbout
        },
        getProfilePicture: {
          method: 'get',
          resourceName: ':contactId/profile-picture',
          handler: contactsController.getProfilePicture
        },
        block: {
          method: 'post',
          resourceName: ':contactId/block',
          handler: contactsController.block
        },
        unblock: {
          method: 'post',
          resourceName: ':contactId/unblock',
          handler: contactsController.unblock
        }
      }
    });


     this.app.resource({
      name: 'wagroups',
      middlewares: [sessionMiddleware],
      actions: {
        create: {
          method: 'post',
          handler: groupsController.create
        },
        getJoinInfo: {
          method: 'get',
          resourceName: 'join-info',
          handler: groupsController.getJoinInfo
        },
        join: {
          method: 'post',
          resourceName: 'join',
          handler: groupsController.join
        },
        list: {
          method: 'get',
          handler: groupsController.list
        },
        get: {
          method: 'get',
          resourceName: ':groupId',
          handler: groupsController.get
        },
        leave: {
          method: 'post',
          resourceName: ':groupId/leave',
          handler: groupsController.leave
        },
        updateDescription: {
          method: 'put',
          resourceName: ':groupId/description',
          handler: groupsController.updateDescription
        },
        updateSubject: {
          method: 'put',
          resourceName: ':groupId/subject',
          handler: groupsController.updateSubject
        },
        getInviteCode: {
          method: 'get',
          resourceName: ':groupId/invite-code',
          handler: groupsController.getInviteCode
        },
        revokeInviteCode: {
          method: 'post',
          resourceName: ':groupId/invite-code/revoke',
          handler: groupsController.revokeInviteCode
        }
      }
    });


     this.app.resource({
      name: 'wapresence',
      middlewares: [sessionMiddleware],
      actions: {
        setPresence: {
          method: 'post',
          handler: presenceController.setPresence
        },
        getAll: {
          method: 'get',
          handler: presenceController.getPresenceAll
        },
        get: {
          method: 'get',
          resourceName: ':chatId',
          handler: presenceController.getPresence
        },
        subscribe: {
          method: 'post',
          resourceName: ':chatId/subscribe',
          handler: presenceController.subscribe
        }
      }
    });

    this.app.resource({
      name: 'wastatus',
      middlewares: [sessionMiddleware],
      actions: {
        // sendText: {
        //   method: 'post',
        //   resourceName: 'text',
        //   handler: statusController.sendTextStatus
        // },
        sendImage: {
          method: 'post',
          resourceName: 'image',
          handler: statusController.sendImageStatus
        },
        sendVoice: {
          method: 'post',
          resourceName: 'voice',
          handler: statusController.sendVoiceStatus
        },
        sendVideo: {
          method: 'post',
          resourceName: 'video',
          handler: statusController.sendVideoStatus
        },
        delete: {
          method: 'post',
          resourceName: 'delete',
          handler: statusController.deleteStatus
        }
      }
    });

    this.app.resource({
      name: 'wascreenshot',
      middlewares: [sessionMiddleware],
      actions: {
        get: {
          method: 'get',
          handler: screenshotController.getScreenshot
        }
      }
    });

     this.app.resource({
      name: 'walabels',
      middlewares: [sessionMiddleware],
      actions: {
        list: {
          method: 'get',
          handler: labelsController.getAll
        },
        getChatLabels: {
          method: 'get',
          resourceName: 'chats/:chatId',
          handler: labelsController.getChatLabels
        },
        putChatLabels: {
          method: 'put',
          resourceName: 'chats/:chatId',
          handler: labelsController.putChatLabels
        },
        getChatsByLabel: {
          method: 'get',
          resourceName: ':labelId/chats',
          handler: labelsController.getChatsByLabel
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
