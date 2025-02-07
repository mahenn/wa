// /src/server/middlewares/session.middleware.ts

import { Context, Next } from '@nocobase/actions';

export async function sessionMiddleware(ctx: Context, next: Next) {
  
  const sessionId = ctx.get('x-session') || ctx.query.session;
  
  if (!sessionId) {
    ctx.throw(400, 'Session ID is required');
  }

  // Add validation for session manager
  if (!ctx.app.sessionManager) {
    ctx.throw(500, 'Session manager not initialized');
  }

  // Verify session exists before proceeding
  const session = await ctx.app.sessionManager.getSession(sessionId);
  if (!session) {
    ctx.throw(404, `Session ${sessionId} not found`);
  }

  ctx.state.sessionId = sessionId;
  ctx.state.session = session; // Store session in state for reuse
  await next();
}