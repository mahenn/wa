// packages/plugins/@nocobase/plugin-wa/src/server/actions/auth.ts

import { Context, Next } from '@nocobase/actions';
import { QR } from '../core/QR';
import { WhatsappSession } from '../core/abc/session.abc';
import { WAHASessionStatus } from '../structures/enums.dto';
import { 
  QRCodeFormat,
  QRCodeQuery,
  QRCodeValue,
  RequestCodeRequest,
  OTPRequest,
  CaptchaBody 
} from '../structures/auth.dto';

export const authActions = {
  // Get QR code for pairing WhatsApp API
  async getQR(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    //const query = ctx.query as QRCodeQuery;
    console.log(session);

    const query: QRCodeQuery = {
      format: (ctx.query.format as QRCodeFormat) || QRCodeFormat.IMAGE
    };

    const waSession = await ctx.app.sessionManager.getSession(session) as WhatsappSession;

    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    const qr = waSession.getQR();
    console.log("qr s ",qr);
    if (query.format === QRCodeFormat.RAW) {
      ctx.body = { value: qr.raw };
    } else {
      ctx.body = await qr.get();
      ctx.type = 'image/png';
    }

    await next();
  },

  // Request authentication code
  async requestCode(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    const request = ctx.request.body as RequestCodeRequest;

    const waSession = await ctx.app.sessionManager.getSession(session);

    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    ctx.body = await waSession.requestCode(
      request.phoneNumber,
      request.method,
      request
    );

    await next();
  },

  // Authorize with OTP code
  async authorizeCode(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    const request = ctx.request.body as OTPRequest;

    const waSession = await ctx.app.sessionManager.getSession(session);

    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    ctx.body = await waSession.authorizeCode(request.code);

    await next();
  },

  // Get captcha image
  async getCaptcha(ctx: Context, next: Next) {
    const { session } = ctx.action.params;

    const waSession = await ctx.app.sessionManager.getSession(session);

    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    const image = await waSession.getCaptcha();
    ctx.body = await image.get();
    ctx.type = 'image/png';

    await next();
  },

  // Submit captcha code
  async submitCaptcha(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    const body = ctx.request.body as CaptchaBody;

    const waSession = await ctx.app.sessionManager.getSession(session);

    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    ctx.body = await waSession.saveCaptcha(body.code);

    await next();
  }
};