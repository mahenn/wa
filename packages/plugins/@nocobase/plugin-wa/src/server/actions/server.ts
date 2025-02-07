// src/server/controllers/server.controller.ts

import { Context, Next } from '@nocobase/actions';
import { WAHAEnvironment } from '../structures/environment.dto';
import { VERSION } from '../version';
import * as lodash from 'lodash';
import { 
  EnvironmentQuery, 
  ServerStatusResponse 
} from '../structures/server.dto';



export const serverController = {
  async getVersion(ctx: Context, next: Next) {
    try {
      ctx.body = VERSION as WAHAEnvironment;
    } catch (error) {
      ctx.throw(500, `Failed to get version: ${error.message}`);
    }
    await next();
  },

  // Get environment variables
  async getEnvironment(ctx: Context, next: Next) {
    try {
      const query = ctx.query;
      let result = process.env;

      if (!query.all) {
        result = lodash.pickBy(result, (value, key) => {
          return (
            key.startsWith('WAHA_') ||
            key.startsWith('WHATSAPP_') ||
            key === 'DEBUG'
          );
        });
      }

      const map = new Map<string, string>();
      Object.keys(result)
        .sort()
        .forEach((key) => {
          map.set(key, result[key]);
        });

      ctx.body = Object.fromEntries(map);
    } catch (error) {
      ctx.throw(500, `Failed to get environment: ${error.message}`);
    }
    await next();
  },

  // Get server status
  async getStatus(ctx: Context, next: Next) {
    try {
      const now = Date.now();
      const uptime = Math.floor(process.uptime() * 1000);
      const startTimestamp = now - uptime;

      const status: ServerStatusResponse = {
        startTimestamp,
        uptime,
        worker: this.workerId // Add this property
      };

      ctx.body = status;
    } catch (error) {
      ctx.throw(500, `Failed to get status: ${error.message}`);
    }
    await next();
  }
};