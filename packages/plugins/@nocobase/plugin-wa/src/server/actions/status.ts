//src/server/controllers/status.controller.ts

import { Context, Next } from '@nocobase/actions';
import { 
  TextStatus, 
  ImageStatus, 
  VoiceStatus, 
  VideoStatus, 
  DeleteStatusRequest 
} from '../structures/status.dto';

export class StatusController {
  async sendTextStatus(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    //const status: TextStatus = ctx.request.body;
    const status = ctx.request.body as TextStatus;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const result = await waSession.sendTextStatus(status);
      ctx.body = result;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async sendImageStatus(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    //const status: ImageStatus = ctx.request.body;
    const status = ctx.request.body as ImageStatus;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const result = await waSession.sendImageStatus(status);
      ctx.body = result;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async sendVoiceStatus(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    //const status: VoiceStatus = ctx.request.body;
    const status = ctx.request.body as VoiceStatus;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const result = await waSession.sendVoiceStatus(status);
      ctx.body = result;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async sendVideoStatus(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    //const status: VideoStatus = ctx.request.body;
    const status = ctx.request.body as VideoStatus;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const result = await waSession.sendVideoStatus(status);
      ctx.body = result;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async deleteStatus(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    //const status: DeleteStatusRequest = ctx.request.body;
    const status = ctx.request.body as DeleteStatusRequest;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const result = await waSession.deleteStatus(status);
      ctx.body = result;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }
}

export const statusController = new StatusController();