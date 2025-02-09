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
import { sessionsActions } from './actions/sessions';
import { statusController } from './actions/status';
import { versionController } from './actions/version';
import { WhatsappConfigService } from './config.service';
import { SessionManagerCore } from './core/manager.core';
import { EngineConfigService } from './core/config/EngineConfigService';
import { MediaLocalStorageConfig } from './core/media/local/MediaLocalStorageConfig';
import { WebJSEngineConfigService } from './core/config/WebJSEngineConfigService';
import { MediaLocalStorageFactory } from './core/media/local/MediaLocalStorageFactory';
import { sessionMiddleware } from './middlewares/session';
import { WaChatRepository } from './repositories/chat.repository';
//import { Gateway } from '../../../../../core/server/src/gateway/index';
import { Gateway } from '@nocobase/server/src/gateway/index';
import { WebSocket } from 'ws';

import { 
  GetChatsQuery,
  GetChatMessagesQuery,
  EditMessageRequest,
  OverviewPaginationParams,
  GetChatMessagesFilter,
  ChatSummary
} from './structures/chats.dto';

import { resolve } from 'path';

export class PluginWaServer extends Plugin {
  private sessionManager: SessionManagerCore;
  private configService: WhatsappConfigService;
  private engineConfig: EngineConfigService;
  private logger: PinoLogger;
  public startTimestamp: number;

  
  async afterAdd() {}

  async beforeLoad() {
  }

  async load() {

    this.startTimestamp = Date.now();

    this.db.import({
      directory: resolve(__dirname, 'collections'),
    });

    const logger = new PinoLogger({
      pinoHttp: {
        level: 'info',
        name: 'WhatsAppPlugin'
      }
    });
    logger.setContext('WhatsAppPlugin'); // Set context before passing to SessionManager


    // this.app.db.registerRepositories({
    //    'wa_chats': WaChatRepository
    // });

    // this.db.collection({
    //   name: 'wa_chats',
    //   repository: WaChatRepository,
    //   // ... other collection config
    // });

    this.engineConfig = new EngineConfigService(this.app.db);
    this.configService = new WhatsappConfigService();
    const mediaLocalStorageConfig = new MediaLocalStorageConfig(this.configService);
    const webjsEngineConfigService = new WebJSEngineConfigService();
    
    // Initialize Media Storage Factory
    const mediaStorageFactory = new MediaLocalStorageFactory(mediaLocalStorageConfig);



    this.sessionManager = new SessionManagerCore(this.configService,
                                                  this.engineConfig,
                                                  webjsEngineConfigService,
                                                  logger,
                                                  mediaStorageFactory);
    // @ts-expect-error
    this.app.sessionManager = this.sessionManager;

    //console.log(this.sessionManager);

    // Handle session startup
    // this.app.on('beforeStart', async () => {
    //   await this.sessionManager.onModuleInit();
    //   // Start predefined sessions if configured
    //   if (this.configService.startSessions.length > 0) {
    //     for (const session of this.configService.startSessions) {
    //       await this.sessionManager.start(session);
    //     }
    //   }
    // });

    // // Handle graceful shutdown
    // this.app.on('beforeStop', async () => {
    //   console.log("before stop even called..................................")
    //   await this.sessionManager.beforeApplicationShutdown();
    // });


    const gateway = Gateway.getInstance();

    // @ts-expect-error
    if (!gateway.wsServer || !gateway.wsServer.wss) {
      console.error('WebSocket is not initialized on the server side');
      return;
    }

    // @ts-expect-error
    const wsServer = gateway.wsServer.wss;


    wsServer.on('connection', async (socket) => {
    // gateway.on('ws:connection', async (socket: WebSocket) => {

    console.log('Client connected to WebSocket');



    // const sub = this.sessionManager.getSessionEvents("default", '*')
    //   .subscribe((data) => {
    //     this.logger.debug(`Sending data to client, event.id: ${data.id}`, data);
    //     socket.send(JSON.stringify(data), (err) => {
    //       if (!err) {
    //         return;
    //       }
    //       this.logger.error(`Error sending data to client: ${err}`);
    //     });
    //   });



    //await this.initializeOrReuseSession(socket, "phone-123");

    const messageHandler = async (message: string) => {
      let parsedMessage;
        try {
          parsedMessage = JSON.parse(message);
        } catch (error) {
          //console.error('Non-JSON message received:', message);
          return;
        }

        try{
        const { sessionId, type, chatId, content,offset } = parsedMessage;

        console.log("paresedMessage",sessionId,type,chatId,content,offset);

        if (!sessionId) {
          console.error('No sessionId found in message');
          return;
        }


        switch (type) {
          case 'start-session':           
              console.log('start-session event:', sessionId);
              socket.send(JSON.stringify({ type: 'ready', message: 'WhatsApp session is ready!' }));
            break;

          case 'logout':
           // console.log(`Logging out session: ${sessionId}`);
           // await this.logoutFromWhatsApp(socket, sessionId);
            break;

          case 'get-messages':
            await this.fetchMessagesForChat(socket, chatId, sessionId,offset);
            break;

          case 'send-message':
          //  console.log(`Send message event received for session: ${sessionId}`);
            //await this.sendChat(socket, chatId, content, sessionId);
            break;

          case 'new-message':
            console.log(`new message received : ${sessionId}`,content);
            await this.handleSendMessage(socket, chatId, content, sessionId);
            break;

          case 'get-contacts':
         //   console.log(`Fetching contacts for session: ${sessionId}`);
           // await this.sendContacts(socket, sessionId);
            break;

          case 'get-chats':
            console.log(`Fetching chats for session: ${sessionId}`);
            await this.sendChats(socket, sessionId);
            //const chats = await session.getChats(query);
            break;
          case 'react-to-message':
            // await this.handleWhatsAppOperation(socket, chatId, content,sessionId, () => this.handleReactToMessage(socket, chatId, content, sessionId));
            break;

          default:
            console.warn('Unhandled event type:', type);
        }

        }catch(error){
        console.log("error in pase message",error.message);
      }
    };


      socket.on('message', messageHandler);

      socket.on('close', () => {
        console.log('WebSocket client disconnected');
        //sub.unsubscribe();
        // this.sessionManager.stop("default", true);
        socket.removeListener('message', messageHandler);
      });

    });


    


    // Register auth actions
    this.app.resource({
      name: 'waauth',
      middlewares: [sessionMiddleware],
      actions: {
        'qr': {
          resource: false,
          method: 'get',
          handler: authActions.getQR
        },
        // 'request-code': {
        //   resource: false,
        //   method: 'post',
        //   handler: authActions.requestCode
        // },
        // 'authorize-code': {
        //   resource: false,
        //   method: 'post',
        //   handler: authActions.authorizeCode
        // },
        // 'captcha': {
        //   resource: false,
        //   method: 'get',
        //   handler: authActions.getCaptcha
        // },
        // 'captchaSubmit': {
        //   resource: false,
        //   method: 'post',
        //   handler: authActions.submitCaptcha
        // }
      }
    });

    this.app.resource({
      name: 'wasessions',
      actions: {
        list: {
          method: 'get',
          handler: sessionsActions.list
        },
        get: {
          method: 'get',
          resourceName: ':session',
          handler: sessionsActions.get
        },
        create: {
          method: 'post',
          handler: sessionsActions.create
        },
        update: {
          method: 'put',
          resourceName: ':session',
          handler: sessionsActions.update
        },
        destroy: {
          method: 'delete',
          resourceName: ':session',
          handler: sessionsActions.destroy
        },
        start: {
          method: 'post',
          resourceName: ':session/start',
          handler: sessionsActions.start
        },
        stop: {
          method: 'post',
          resourceName: ':session/stop',
          handler: sessionsActions.stop
        },
        restart: {
          method: 'post',
          resourceName: ':session/stop',
          handler: sessionsActions.restart
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
        chatsummary: {
          method: 'get',
          handler: chatsController.getChatsOverview
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
        sendText: {
          method: 'post',
          resourceName: 'text',
          handler: statusController.sendTextStatus
        },
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

  private async sendChats(socket: WebSocket, sessionId: string) {

    const client = await this.sessionManager.getSession(sessionId);

    try {
      // const pagination: ChatsPaginationParams = { limit: 100, offset: 0  };
      // const chats =  await client.getChats(pagination);

      const pagination: OverviewPaginationParams = { limit: 100, offset: 0  };
      const chats: ChatSummary[] = await client.getChatsOverview(pagination);

      console.log(`Chats for sessionId: ${sessionId}`, chats.length);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({type: 'chats',chats,}));
      }
    } catch (error) {
      //console.log(client);
      console.error(`Error fetching chats for sessionId: ${sessionId}`, error.message);
    }
  }


  private async fetchMessagesForChat(socket: WebSocket, chatId: string, sessionId: string, offset = 0) {
    
    const client = await this.sessionManager.getSession(sessionId);

    try {
      //const chat = await client.getChatMessages(chatId);

      const query = {
        session: sessionId ,
        limit: 50,
        offset: offset,
        sortOrder: 'ASC',
        downloadMedia: true
      };

      //const query: GetChatMessagesQuery = null;
      const filter: GetChatMessagesFilter = {};

      //const messages = await client.getChatMessages(chatId, query.limit, query.downloadMedia);
      const messages = await client.getChatMessages(chatId, query, filter)

      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'messages',
          chatId,
          messages: messages, //processedMessages, // Send processed messages including media data
        }));
      }
    } catch (error) {
      console.error(`Error fetching messages for chatId: ${chatId}`, error.message);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Error fetching messages.',
        }));
      }
    }
  }


  private async handleSendMessage(socket: WebSocket, chatId: string, messageData: any, sessionId: string) {
    
    const client = await this.sessionManager.getSession(sessionId);

    if (!client) {
      console.error(`Session not found for sessionId: ${sessionId}`);
      return;
    }

    const { type, content, replyTo } = messageData;

    switch (type) {
        case 'text':

          try {
            const result = await client.sendText({
              chatId,
              text:content
            });
            const message = await client.toWAMessage(result);
            console.log("send message here",message);
            
        socket.send(JSON.stringify({ type: 'message-sent', chatId, message }));

          } catch (error) {
            console.log("error in sending message",error.message);
          }
          // await api.resource('wachat').sendText({
          //   session: sessionId,
          //   chatId: selectedChatId,
          //   text: content
          // });
           break;
          
        // case 'image':
        //   await api.resource('wachat').sendImage({
        //     session: sessionId,
        //     chatId: selectedChatId,
        //     file: content,
        //     caption: messageData.caption
        //   });
        //   break;
          
        // case 'video':
        //   await api.resource('wachat').sendVideo({
        //     session: sessionId,
        //     chatId: selectedChatId,
        //     file: content,
        //     caption: messageData.caption
        //   });
        //   break;
          
        // case 'file':
        //   await api.resource('wachat').sendFile({
        //     session: sessionId,
        //     chatId: selectedChatId,
        //     file: content
        //   });
        //   break;
      }



    // let message;
    // try {
    //   let options: any = {};
    //   if (content.replyTo) {
    //     const quotedMessage = await client.getMessageById(content.replyTo._serialized);
    //     if (quotedMessage) {
    //       options.quotedMessageId = quotedMessage.id._serialized;
    //     }
    //   }
    //   if (content.type === 'text') {
    //     message = await client.sendMessage(chatId, content.content, options);
    //   } else if (content.type === 'media') {
    //     // Handle media message
    //     const media = new MessageMedia(content.media.mimetype, content.content, content.media.filename);
    //     message = await client.sendMessage(chatId, media, { caption: content.media.caption || '', ...options });
    //   } else {
    //     message = await client.sendMessage(chatId, content.content, options);
    //     console.log("Sent other message", message);
    //   }

    //   socket.send(JSON.stringify({ type: 'message-sent', chatId, message }));
    // } catch (error) {
    //   console.error('Error sending message:', error);
    //   socket.send(JSON.stringify({
    //     type: 'error',
    //     message: 'Error sending message.',
    //   }));
    // }
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}

  private setupErrorHandlers() {
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      if (reason instanceof Error) {
        this.logger.error(reason.stack);
      }
    });

    // Handle SIGINT (Ctrl+C)
    // process.on('SIGINT', () => {
    //   this.logger.info('SIGINT received');
    //   // Clean up WhatsApp sessions
    //   this.cleanupSessions();
    // });

    // // Handle SIGTERM
    // process.on('SIGTERM', () => {
    //   this.logger.info('SIGTERM received');
    //   // Clean up WhatsApp sessions
    //   this.cleanupSessions();
    // });
  }

  private async cleanupSessions() {
    try {
      // Get all active sessions and close them gracefully
      const sessions = await this.app.db.getRepository('wa_sessions').find();
      for (const session of sessions) {
        await session.end();
      }
      this.logger.info('All WhatsApp sessions cleaned up');
    } catch (error) {
      this.logger.error('Error cleaning up sessions:', error);
    }
  }
}

export default PluginWaServer;
