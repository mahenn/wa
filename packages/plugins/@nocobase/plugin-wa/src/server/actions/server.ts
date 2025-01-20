// src/server/controllers/server.controller.ts

import { Context, Next } from '@nocobase/actions';
import { ServerStatus, ServerResponse, SystemMetrics } from '../structures/server.dto';
//import { getSystemMetrics } from '../utils/metrics';

export const serverController = {
  /**
   * Get server status and information
   */
  async status(ctx: Context, next: Next) {
    try {
      //const metrics = await getSystemMetrics();
      
      const status: ServerStatus = {
        sessions: {
          total: await ctx.app.sessionManager.getSessionCount(),
          running: await ctx.app.sessionManager.getRunningSessionCount(),
          failed: await ctx.app.sessionManager.getFailedSessionCount()
        },
        //system: metrics,
        uptime: process.uptime(),
        startTime: process.env.NODE_APP_INSTANCE 
          ? new Date(Number(process.env.NODE_APP_INSTANCE)).toISOString()
          : new Date().toISOString()
      };

      ctx.body = status;
    } catch (error) {
      ctx.throw(500, `Failed to get server status: ${error.message}`);
    }
    await next();
  },

  /**
   * Stop all sessions and shutdown server gracefully
   */
  async shutdown(ctx: Context, next: Next) {
    try {
      ctx.app.logger.info('Server shutdown initiated');
      
      // Stop all sessions gracefully
      await ctx.app.sessionManager.stopAll({
        reason: 'Server shutdown',
        logout: true
      });
      
      const response: ServerResponse = { 
        message: 'Server shutdown initiated',
        timestamp: new Date().toISOString()
      };
      
      ctx.body = response;
      
      // Schedule shutdown after response is sent
      setTimeout(() => {
        ctx.app.logger.info('Executing server shutdown');
        process.exit(0);
      }, 2000);

    } catch (error) {
      ctx.throw(500, `Failed to shutdown server: ${error.message}`);
    }
    await next();
  },

  /**
   * Stop all sessions
   */
  async stopAll(ctx: Context, next: Next) {
    try {
      ctx.app.logger.info('Stopping all sessions');
      
      const stoppedCount = await ctx.app.sessionManager.stopAll({
        reason: 'Admin request',
        logout: false
      });

      const response: ServerResponse = {
        message: `Successfully stopped ${stoppedCount} sessions`,
        timestamp: new Date().toISOString()
      };

      ctx.body = response;
    } catch (error) {
      ctx.throw(500, `Failed to stop all sessions: ${error.message}`);
    }
    await next();
  },

  /**
   * Get detailed system metrics
   */
  async metrics(ctx: Context, next: Next) {
    try {
      const metrics = await getSystemMetrics();
      ctx.body = metrics;
    } catch (error) {
      ctx.throw(500, `Failed to get system metrics: ${error.message}`);
    }
    await next();
  }
};