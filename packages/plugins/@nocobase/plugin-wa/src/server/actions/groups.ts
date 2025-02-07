//src/server/controllers/groups.controller.ts

import { Context, Next } from '@nocobase/actions';
import { 
  CreateGroupRequest, 
  DescriptionRequest, 
  SubjectRequest 
} from '../structures/groups.dto';


export class GroupsController {
  async create(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    //const { subject, participants } = ctx.request.body;
    const body = ctx.request.body as CreateGroupRequest;
    const { name, participants } = body;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const result = await waSession.createGroup({ name, participants });
      ctx.body = result;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async getJoinInfo(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    //const { code } = ctx.query;
    const code = ctx.query.code as string; 

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      //const cleanCode = code.split('/').pop();
      const cleanCode = typeof code === 'string' ? code.split('/').pop() : '';
      const info = await waSession.joinInfoGroup(cleanCode);
      ctx.body = info;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async join(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    //const { code } = ctx.request.body;
    const { code } = ctx.request.body as { code: string };


    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const cleanCode = code.split('/').pop();
      const id = await waSession.joinGroup(cleanCode);
      ctx.body = { id };
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async list(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    const { page = 1, limit = 100 } = ctx.query;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const groups = await waSession.getGroups({ page, limit });
      ctx.body = groups;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async get(ctx: Context, next: Next) {
    const { session, groupId } = ctx.action.params;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const group = await waSession.getGroup(groupId);
      ctx.body = group;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async leave(ctx: Context, next: Next) {
    const { session, groupId } = ctx.action.params;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      await waSession.leaveGroup(groupId);
      ctx.body = { success: true };
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async updateDescription(ctx: Context, next: Next) {
    const { session, groupId } = ctx.action.params;
    //const { description } = ctx.request.body;
    const body = ctx.request.body as DescriptionRequest;
    const { description } = body;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const result = await waSession.setDescription(groupId, description);
      ctx.body = { success: result };
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async updateSubject(ctx: Context, next: Next) {
    const { session, groupId } = ctx.action.params;
    //const { subject } = ctx.request.body;
    const body = ctx.request.body as SubjectRequest;
    const { subject } = body;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const result = await waSession.setSubject(groupId, subject);
      ctx.body = { success: result };
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async getInviteCode(ctx: Context, next: Next) {
    const { session, groupId } = ctx.action.params;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const code = await waSession.getInviteCode(groupId);
      ctx.body = { code };
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async revokeInviteCode(ctx: Context, next: Next) {
    const { session, groupId } = ctx.action.params;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const newCode = await waSession.revokeInviteCode(groupId);
      ctx.body = { code: newCode };
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }
}

export const groupsController = new GroupsController();