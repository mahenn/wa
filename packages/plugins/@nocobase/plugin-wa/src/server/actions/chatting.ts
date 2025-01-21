// src/server/controllers/chatting.controller.ts

import { Context, Next } from '@nocobase/actions';
import { parseBool } from '../helpers';

export class ChattingController {
  async sendText(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    const { chatId, text } = ctx.request.body;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const result = await waSession.sendText({
        chatId,
        text,
        session
      });
      ctx.body = result;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async sendImage(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    const { chatId, image, caption } = ctx.request.body;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const result = await waSession.sendImage({
        chatId,
        image,
        caption,
        session
      });
      ctx.body = result;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async sendFile(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    const { chatId, file, filename } = ctx.request.body;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const result = await waSession.sendFile({
        chatId,
        file,
        filename,
        session
      });
      ctx.body = result;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async sendVoice(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    const { chatId, audio } = ctx.request.body;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const result = await waSession.sendVoice({
        chatId,
        audio,
        session
      });
      ctx.body = result;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async sendVideo(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    const { chatId, video, caption } = ctx.request.body;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const result = await waSession.sendVideo({
        chatId,
        video,
        caption,
        session
      });
      ctx.body = result;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async sendSeen(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    const { chatId } = ctx.request.body;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      await waSession.sendSeen({ chatId, session });
      ctx.body = { success: true };
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async setReaction(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    const { messageId, reaction } = ctx.request.body;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const result = await waSession.setReaction({
        messageId,
        reaction,
        session
      });
      ctx.body = result;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }
}

export const chattingController = new ChattingController();