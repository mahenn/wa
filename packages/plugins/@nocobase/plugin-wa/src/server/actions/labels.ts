// /src/server/controllers/labels.controller.ts

import { Context, Next } from '@nocobase/actions';
import { Label } from '../structures/labels.dto';

export class LabelsController {

  async getAll(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    
    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const labels = await waSession.getLabels();
      ctx.body = labels;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async getChatLabels(ctx: Context, next: Next) {

    const { session, chatId } = ctx.action.params;
    
    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const labels = await waSession.getChatLabels(chatId);
      ctx.body = labels;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async putChatLabels(ctx: Context, next: Next) {

    const { session, chatId } = ctx.action.params;
    //const request = ctx.request.body;
    const request = ctx.request.body as { labels: string[] }; // Add type assertion

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const result = await waSession.putLabelsToChat(chatId, request.labels);
      ctx.body = result;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async getChatsByLabel(ctx: Context, next: Next) {

    const { session, labelId } = ctx.action.params;
    
    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const chats = await waSession.getChatsByLabelId(labelId);
      ctx.body = chats;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }
}

export const labelsController = new LabelsController();