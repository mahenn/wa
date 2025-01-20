// src/server/controllers/version.controller.ts

import { Context, Next } from '@nocobase/actions';
import { WAHAEnvironment } from '../structures/environment.dto';
import { VERSION } from '../version';

export const versionController = {
  /**
   * Get version information
   */
  async get(ctx: Context, next: Next) {
    try {
      const version = VERSION;
      ctx.body = { version };
    } catch (error) {
      ctx.throw(500, `Failed to get version: ${error.message}`);
    }
    await next();
  }
};