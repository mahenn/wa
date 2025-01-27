// src/server/controllers/sessions.controller.ts

import { Context, Next } from '@nocobase/actions';
import { generatePrefixedId } from '../utils/ids';
import { 
  ListSessionsQuery,
  SessionCreateRequest, 
  SessionUpdateRequest
} from '../structures/sessions.dto';
import { WHATSAPP_DEFAULT_SESSION_NAME } from '../structures/base.dto';

import AsyncLock from 'async-lock';

class SessionController {
  private lock: AsyncLock;

  constructor() {
    // Initialize AsyncLock with infinite pending operations
    this.lock = new AsyncLock({ 
      maxPending: Infinity,
      timeout: 10000 // 10 second timeout
    });
  }

  private async withLock(name: string, fn: () => Promise<any>) {
    return this.lock.acquire(name, fn);
  }

  async list(ctx: Context, next: Next) {
    const query = ctx.query as ListSessionsQuery;
    try {
      const sessions = await ctx.app.sessionManager.getSessions(query.all);
      ctx.body = sessions;
    } catch (error) {
      ctx.throw(500, `Failed to list sessions: ${error.message}`);
    }
    await next();
  }

  async get(ctx: Context, next: Next) {
    const { session = WHATSAPP_DEFAULT_SESSION_NAME } = ctx.action.params;
    try {
      const sessionInfo = await ctx.app.sessionManager.getSessionInfo(session);
      if (!sessionInfo) {
        ctx.throw(404, 'Session not found');
      }
      ctx.body = sessionInfo;
    } catch (error) {
      ctx.throw(500, `Failed to get session: ${error.message}`);
    }
    await next();
  }

  async create(ctx: Context, next: Next) {
    const request = ctx.request.body as SessionCreateRequest;
    const name = request.name || generatePrefixedId('session');

    try {
      await this.withLock(name, async () => {
        if (await ctx.app.sessionManager.exists(name)) {
          ctx.throw(422, `Session '${name}' already exists`);
        }

        await ctx.app.sessionManager.upsert(name, request.config);
        
        if (request.start) {
          await ctx.app.sessionManager.start(name);
        }
      });

      ctx.body = await ctx.app.sessionManager.getSessionInfo(name);
    } catch (error) {
      ctx.throw(500, `Failed to create session: ${error.message}`);
    }
    await next();
  }

  async update(ctx: Context, next: Next) {
    const { session = WHATSAPP_DEFAULT_SESSION_NAME } = ctx.action.params;
    const request = ctx.request.body as SessionUpdateRequest;
    console.log(request);
    try {
      await this.withLock(session, async () => {
        if (!(await ctx.app.sessionManager.exists(session))) {
          ctx.throw(404, 'Session not found');
        }

        const wasRunning = ctx.app.sessionManager.isRunning(session);
        await ctx.app.sessionManager.stop(session, true);
        await ctx.app.sessionManager.upsert(session, request.config);
        
        if (wasRunning) {
          await ctx.app.sessionManager.start(session);
        }
      });

      ctx.body = await ctx.app.sessionManager.getSessionInfo(session);
    } catch (error) {
      ctx.throw(500, `Failed to update session: ${error.message}`);
    }
    await next();
  }

  async destroy(ctx: Context, next: Next) {
    const { session = WHATSAPP_DEFAULT_SESSION_NAME } = ctx.action.params;

    try {
      await this.withLock(session, async () => {
        await ctx.app.sessionManager.stop(session, true);
        await ctx.app.sessionManager.logout(session);
        await ctx.app.sessionManager.delete(session);
      });
      ctx.status = 204;
    } catch (error) {
      ctx.throw(500, `Failed to delete session: ${error.message}`);
    }
    await next();
  }

  async start(ctx: Context, next: Next) {
    const { session = WHATSAPP_DEFAULT_SESSION_NAME } = ctx.action.params;

    try {
      await this.withLock(session, async () => {
        if (!(await ctx.app.sessionManager.exists(session))) {
          ctx.throw(404, 'Session not found');
        }
        //await ctx.app.sessionManager.assign(session);
        await ctx.app.sessionManager.start(session);
      });

      ctx.body = await ctx.app.sessionManager.getSessionInfo(session);
    } catch (error) {
      ctx.throw(500, `Failed to start session: ${error.message}`);
    }
    await next();
  }







  async stop(ctx: Context, next: Next) {
    const { session = WHATSAPP_DEFAULT_SESSION_NAME } = ctx.action.params;

    try {
      await this.withLock(session, async () => {
        //await ctx.app.sessionManager.unassign(session);
        await ctx.app.sessionManager.stop(session, false);
      });

      ctx.body = await ctx.app.sessionManager.getSessionInfo(session);
    } catch (error) {
      ctx.throw(500, `Failed to stop session: ${error.message}`);
    }
    await next();
  }

  async restart(ctx: Context, next: Next) {
    const { session = WHATSAPP_DEFAULT_SESSION_NAME } = ctx.action.params;

    try {
      await this.withLock(session, async () => {
        if (!(await ctx.app.sessionManager.exists(session))) {
          ctx.throw(404, 'Session not found');
        }
        //await ctx.app.sessionManager.assign(session);
        await ctx.app.sessionManager.stop(session, true);
        await ctx.app.sessionManager.start(session);
      });

      ctx.body = await ctx.app.sessionManager.getSessionInfo(session);
    } catch (error) {
      ctx.throw(500, `Failed to restart session: ${error.message}`);
    }
    await next();
  }
}

const sessionsController = new SessionController();

// Export individual action handlers bound to the controller instance
export const sessionsActions = {
  start: sessionsController.start.bind(sessionsController),
  list: sessionsController.list.bind(sessionsController),
  get: sessionsController.get.bind(sessionsController),
  create: sessionsController.create.bind(sessionsController),
  update: sessionsController.update.bind(sessionsController),
  destroy: sessionsController.destroy.bind(sessionsController),
  stop: sessionsController.stop.bind(sessionsController),
  restart: sessionsController.restart.bind(sessionsController),
  // Other actions...
};