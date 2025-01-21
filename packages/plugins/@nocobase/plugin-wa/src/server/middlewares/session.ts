// /src/server/middlewares/session.middleware.ts

import { Context, Next } from '@nocobase/actions';

export async function sessionMiddleware(ctx: Context, next: Next) {
  const sessionId = ctx.get('x-session') || ctx.query.session;
  
  if (!sessionId) {
    ctx.throw(400, 'Session ID is required');
  }

  ctx.state.sessionId = sessionId;
  await next();
}