// src/server/controllers/screenshot.controller.ts

import { Context, Next } from '@nocobase/actions';

export class ScreenshotController {
  async getScreenshot(ctx: Context, next: Next) {
    const { session } = ctx.action.params;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const screenshot = await waSession.getScreenshot();
      
      // Set appropriate headers for image response
      ctx.set('Content-Type', 'image/png');
      ctx.set('Content-Disposition', 'inline; filename="screenshot.png"');
      
      // Send the buffer directly as response
      ctx.body = screenshot;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }
}

export const screenshotController = new ScreenshotController();