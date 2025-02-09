// src/server/controllers/chatting.controller.ts

import { Context, Next } from '@nocobase/actions';
import { parseBool } from '../helpers';
import {
  MessageTextRequest,
  MessageImageRequest,
  MessageFileRequest,
  MessageVoiceRequest,
  MessageVideoRequest,
  ChatRequest,
  MessageReactionRequest
} from '../structures/chatting.dto';

export class ChattingController {
  
  async sendText(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    const body = ctx.request.body as MessageTextRequest;
    const { chatId, text } = body;

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

    //const { chatId, image, caption } = ctx.request.body;
    const body = ctx.request.body as MessageImageRequest;
    const { chatId, file: image, caption } = body;

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
    //const { chatId, file, filename } = ctx.request.body;
    const body = ctx.request.body as MessageFileRequest;
    const { chatId, file } = body;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const result = await waSession.sendFile({
        chatId,
        file,
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
    //const { chatId, audio } = ctx.request.body;
    const body = ctx.request.body as MessageVoiceRequest;
    const { chatId, file: audio } = body;

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
    //const { chatId, video, caption } = ctx.request.body;
    const body = ctx.request.body as MessageVideoRequest;
    const { chatId, file: video, caption } = body;
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
    //const { chatId } = ctx.request.body;
    const body = ctx.request.body as ChatRequest;
    const { chatId } = body;

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
    //const { messageId, reaction } = ctx.request.body;
    const body = ctx.request.body as MessageReactionRequest;
    const { messageId, reaction } = body;

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