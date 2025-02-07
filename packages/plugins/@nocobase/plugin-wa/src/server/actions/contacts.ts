//src/server/controllers/contacts.controller.ts

import { Context, Next } from '@nocobase/actions';
import { ContactRequest } from '../structures/contacts.dto';


export class ContactsController {
  async getAll(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    const { page = 1, limit = 100 } = ctx.query;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const contacts = await waSession.getContacts({ page, limit });
      ctx.body = contacts;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async get(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    const { contactId } = ctx.query;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const contact = await waSession.getContact({ contactId });
      ctx.body = contact;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async checkExists(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    const { phone } = ctx.query;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const result = await waSession.checkNumberStatus({ phone });
      ctx.body = result;
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async getAbout(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    const { contactId } = ctx.query;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const about = await waSession.getContactAbout({ contactId });
      ctx.body = { about };
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async getProfilePicture(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    const { contactId, refresh = false } = ctx.query;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      const url = await waSession.getContactProfilePicture(contactId, refresh);
      ctx.body = { profilePictureURL: url };
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async block(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    //const { contactId } = ctx.request.body;
    const body = ctx.request.body as ContactRequest;
    const { contactId } = body;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      await waSession.blockContact({ contactId });
      ctx.body = { success: true };
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }

  async unblock(ctx: Context, next: Next) {
    const { session } = ctx.action.params;
    //const { contactId } = ctx.request.body;
    const body = ctx.request.body as ContactRequest;
    const { contactId } = body;

    const waSession = await ctx.app.sessionManager.getSession(session);
    if (!waSession) {
      ctx.throw(404, `Session ${session} not found`);
    }

    try {
      await waSession.unblockContact({ contactId });
      ctx.body = { success: true };
    } catch (error) {
      ctx.throw(400, error.message);
    }

    await next();
  }
}

export const contactsController = new ContactsController();