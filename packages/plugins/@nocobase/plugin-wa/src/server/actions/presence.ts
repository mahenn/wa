//src/server/controllers/presence.controller.ts

import { Context, Next } from '@nocobase/actions';
import { WAHASessionPresence } from '../structures/presence.dto';


export enum WAHAPresenceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  TYPING = 'typing',
  RECORDING = 'recording',
  PAUSED = 'paused',
}

export class PresenceController {
  async setPresence(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    //const { presence, chatId } = ctx.request.body;
    const body = ctx.request.body as WAHASessionPresence;
    const { presence, chatId } = body;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    // Validate request
    const presencesWithoutChatId = [
      WAHAPresenceStatus.ONLINE,
      WAHAPresenceStatus.OFFLINE,
    ];
    const requiresNoChatId = presencesWithoutChatId.includes(presence);
    const requiresChatId = !requiresNoChatId;

    if (requiresNoChatId && chatId) {
      ctx.throw(400, `'${presence}' presence works on the global scope and doesn't require 'chatId' field.`);
    } else if (requiresChatId && !chatId) {
      ctx.throw(400, `'${presence}' presence requires 'chatId' field.`);
    }

    try {
      const result = await waSession.setPresence(presence, chatId);
      ctx.body = result;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async getPresenceAll(ctx: Context, next: Next) {
    const { session } = ctx.action.params;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const presences = await waSession.getPresences();
      ctx.body = presences;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async getPresence(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    const { chatId } = ctx.query;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const presence = await waSession.getPresence(chatId);
      ctx.body = presence;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async subscribe(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    //const { chatId } = ctx.request.body;
    const body = ctx.request.body as { chatId: string };
    const { chatId } = body;
    
    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      await waSession.subscribePresence(chatId);
      ctx.body = { success: true };
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }
}

export const presenceController = new PresenceController();