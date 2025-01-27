// packages/plugins/@nocobase/plugin-wa/src/server/controllers/channels.controller.ts

import { Context, Next } from '@nocobase/actions';
import { Channel, CreateChannelRequest, ListChannelsQuery } from '../structures/channels.dto';
import { isNewsletter } from '../core/abc/session.abc';
import { WHATSAPP_DEFAULT_SESSION_NAME } from '../structures/base.dto';

export const channelActions = {
  /**
   * Get list of known channels
   */
  async list(ctx: Context, next: Next) {
    try {
      const { sessionId = WHATSAPP_DEFAULT_SESSION_NAME } = ctx.action.params;
      const session = await ctx.app.sessionManager.getSession(sessionId);
      if (!session) {
        ctx.throw(404, 'Session not found');
      }

      const query: ListChannelsQuery = ctx.query;
      const channels: Channel[] = await session.channelsList(query);
      
      ctx.body = channels;
    } catch (error) {
      ctx.throw(500, `Failed to list channels: ${error.message}`);
    }
    await next();
  },

  /**
   * Create a new channel
   */
  async create(ctx: Context, next: Next) {
    try {
      const { sessionId = WHATSAPP_DEFAULT_SESSION_NAME } = ctx.action.params;
      const session = await ctx.app.sessionManager.getSession(sessionId);
      if (!session) {
        ctx.throw(404, 'Session not found');
      }

     // const request: CreateChannelRequest = ctx.request.body;
      const request = ctx.request.body as CreateChannelRequest;

      const channel = await session.channelsCreateChannel(request);
      
      ctx.body = channel;
      ctx.status = 201;
    } catch (error) {
      ctx.throw(500, `Failed to create channel: ${error.message}`);
    }
    await next();
  },

  /**
   * Delete the channel
   */
  async delete(ctx: Context, next: Next) {
    try {
      const { sessionId = WHATSAPP_DEFAULT_SESSION_NAME } = ctx.action.params;
      const session = await ctx.app.sessionManager.getSession(sessionId);
      if (!session) {
        ctx.throw(404, 'Session not found');
      }

      const { id } = ctx.action.params;
      await session.channelsDeleteChannel(id);
      
      ctx.status = 204;
    } catch (error) {
      ctx.throw(500, `Failed to delete channel: ${error.message}`);
    }
    await next();
  },

  /**
   * Get channel info by ID or invite code
   */
  async get(ctx: Context, next: Next) {
    try {
      const { sessionId = WHATSAPP_DEFAULT_SESSION_NAME } = ctx.action.params;
      const session = await ctx.app.sessionManager.getSession(sessionId);
      if (!session) {
        ctx.throw(404, 'Session not found');
      }

      const { id } = ctx.action.params;
      let channel: Channel;

      if (isNewsletter(id)) {
        channel = await session.channelsGetChannel(id);
      } else {
        // Handle invite code format: https://www.whatsapp.com/channel/123
        const inviteCode = id.split('/').pop();
        channel = await session.channelsGetChannelByInviteCode(inviteCode);
      }

      ctx.body = channel;
    } catch (error) {
      ctx.throw(500, `Failed to get channel: ${error.message}`);
    }
    await next();
  },

  /**
   * Follow a channel
   */
  async follow(ctx: Context, next: Next) {
    try {
      const { sessionId = WHATSAPP_DEFAULT_SESSION_NAME } = ctx.action.params;
      const session = await ctx.app.sessionManager.getSession(sessionId);
      if (!session) {
        ctx.throw(404, 'Session not found');
      }

      const { id } = ctx.action.params;
      await session.channelsFollowChannel(id);
      
      ctx.status = 204;
    } catch (error) {
      ctx.throw(500, `Failed to follow channel: ${error.message}`);
    }
    await next();
  },

  /**
   * Unfollow a channel
   */
  async unfollow(ctx: Context, next: Next) {
    try {
      const { sessionId = WHATSAPP_DEFAULT_SESSION_NAME } = ctx.action.params;
      const session = await ctx.app.sessionManager.getSession(sessionId);
      if (!session) {
        ctx.throw(404, 'Session not found');
      }

      const { id } = ctx.action.params;
      await session.channelsUnfollowChannel(id);
      
      ctx.status = 204;
    } catch (error) {
      ctx.throw(500, `Failed to unfollow channel: ${error.message}`);
    }
    await next();
  },

  /**
   * Mute a channel
   */
  async mute(ctx: Context, next: Next) {
    try {
      const { sessionId = WHATSAPP_DEFAULT_SESSION_NAME } = ctx.action.params;
      const session = await ctx.app.sessionManager.getSession(sessionId);
      if (!session) {
        ctx.throw(404, 'Session not found');
      }

      const { id } = ctx.action.params;
      await session.channelsMuteChannel(id);
      
      ctx.status = 204;
    } catch (error) {
      ctx.throw(500, `Failed to mute channel: ${error.message}`);
    }
    await next();
  },

  /**
   * Unmute a channel
   */
  async unmute(ctx: Context, next: Next) {
    try {
      const { sessionId = WHATSAPP_DEFAULT_SESSION_NAME } = ctx.action.params;
      const session = await ctx.app.sessionManager.getSession(  sessionId);
      if (!session) {
        ctx.throw(404, 'Session not found');
      }

      const { id } = ctx.action.params;
      await session.channelsUnmuteChannel(id);
      
      ctx.status = 204;
    } catch (error) {
      ctx.throw(500, `Failed to unmute channel: ${error.message}`);
    }
    await next();
  }
};