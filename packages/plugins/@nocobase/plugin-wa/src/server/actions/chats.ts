// packages/plugins/@nocobase/plugin-wa/src/server/controllers/chats.controller.ts

import { Context, Next } from '@nocobase/actions';
import { 
  GetChatsQuery,
  GetChatMessagesQuery,
  ChatPictureQuery,
  ChatPictureResponse,
  PinMessageRequest,
  EditMessageRequest,
  ChatsPaginationParams,
  OverviewPaginationParams,
  ChatSummary
} from '../structures/chats.dto';
import { parseBool } from '../helpers';

export const chatsController = {
  /**
   * Get chats
   */
  async getChats(ctx: Context, next: Next) {
    try {
      const session = ctx.state.session

      const pagination: ChatsPaginationParams = ctx.query;
      const chats = await session.getChats(pagination);
      ctx.body = chats;
    } catch (error) {
      ctx.throw(500, `Failed to get chats: ${error.message}`);
    }
    await next();
  },

  /**
   * Get chats overview
   */
  async getChatsOverview(ctx: Context, next: Next) {
    try {
      const session = ctx.state.session;
      const pagination: OverviewPaginationParams = ctx.query;
      const overview: ChatSummary[] = await session.getChatsOverview(pagination);
      ctx.body = overview;
    } catch (error) {
      ctx.throw(500, `Failed to get chats overview: ${error.message}`);
    }
    await next();
  },


  /**
   * Delete chat
   */
  async deleteChat(ctx: Context, next: Next) {
    try {
      const session = ctx.state.session
      if (!session) {
        ctx.throw(404, 'Session not found');
      }

      const { chatId } = ctx.action.params;
      
      await session.deleteChat(chatId);
      ctx.status = 204;
    } catch (error) {
      ctx.throw(500, `Failed to delete chat: ${error.message}`);
    }
    await next();
  },

  /**
   * Get chat messages
   */
  async getChatMessages(ctx: Context, next: Next) {
    try {
      const session = ctx.state.session
      if (!session) {
        ctx.throw(404, 'Session not found');
      }

      const { chatId } = ctx.action.params;

      //const query: GetChatMessagesQuery = ctx.query;
      const query: GetChatMessagesQuery = {
        //session: ctx.state.sessionId ,
        limit: Number(ctx.query.limit) || 100,
        downloadMedia: parseBool(ctx.query.downloadMedia ?? true)
      };

      const messages = await session.getChatMessages(chatId, query.limit, query.downloadMedia);
      ctx.body = messages;
    } catch (error) {
      ctx.throw(500, `Failed to get chat messages: ${error.message}`);
    }
    await next();
  },

  /**
   * Clear all messages from chat
   */
  async clearMessages(ctx: Context, next: Next) {
    try {
      const session = await ctx.app.sessionManager.getSession(ctx.state.sessionId);
      if (!session) {
        ctx.throw(404, 'Session not found');
      }

      const { chatId } = ctx.action.params;
      await session.clearMessages(chatId);
      ctx.status = 204;
    } catch (error) {
      ctx.throw(500, `Failed to clear messages: ${error.message}`);
    }
    await next();
  },

  /**
   * Delete message
   */
  async deleteMessage(ctx: Context, next: Next) {
    try {
      const session = await ctx.app.sessionManager.getSession(ctx.state.sessionId);
      if (!session) {
        ctx.throw(404, 'Session not found');
      }

      const { chatId, messageId } = ctx.action.params;
      await session.deleteMessage(chatId, messageId);
      ctx.status = 204;
    } catch (error) {
      ctx.throw(500, `Failed to delete message: ${error.message}`);
    }
    await next();
  },

  /**
   * Edit message
   */
  async editMessage(ctx: Context, next: Next) {
    try {
      const session = await ctx.app.sessionManager.getSession(ctx.state.sessionId);
      if (!session) {
        ctx.throw(404, 'Session not found');
      }

      const { chatId, messageId } = ctx.action.params;
      const body = ctx.request.body;
      await session.editMessage(chatId, messageId, body);
      ctx.status = 204;
    } catch (error) {
      ctx.throw(500, `Failed to edit message: ${error.message}`);
    }
    await next();
  },

  /**
   * Archive chat
   */
  async archiveChat(ctx: Context, next: Next) {
    try {
      const session = await ctx.app.sessionManager.getSession(ctx.state.sessionId);
      if (!session) {
        ctx.throw(404, 'Session not found');
      }

      const { chatId } = ctx.action.params;
      await session.chatsArchiveChat(chatId);
      ctx.status = 204;
    } catch (error) {
      ctx.throw(500, `Failed to archive chat: ${error.message}`);
    }
    await next();
  },

  /**
   * Unarchive chat
   */
  async unarchiveChat(ctx: Context, next: Next) {
    try {
      const session = await ctx.app.sessionManager.getSession(ctx.state.sessionId);
      if (!session) {
        ctx.throw(404, 'Session not found');
      }

      const { chatId } = ctx.action.params;
      await session.chatsUnarchiveChat(chatId);
      ctx.status = 204;
    } catch (error) {
      ctx.throw(500, `Failed to unarchive chat: ${error.message}`);
    }
    await next();
  }
};