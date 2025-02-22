//import { Injectable } from '@nestjs/common';
import { WAHAEvents } from './structures/enums.dto';
import { parseBool } from './helpers';
import { WebhookConfig } from './structures/webhooks.config.dto';


//@Injectable()
export class WhatsappConfigService {
  protected _workerId: string;
  
  get workerId() {
    return this._workerId || '';
  }

  constructor() {
  }

  // private get configService(): Configuration {
  //   return this.app.config;
  // }

  get schema() {
    return process.env.WHATSAPP_API_SCHEMA || 'http';
  }

  get hostname(): string {
    return process.env.WHATSAPP_API_HOSTNAME || 'localhost';
  }

  get port(): string {
    return process.env.WHATSAPP_API_PORT || '3000';
  }

  get mimetypes(): string[] {
    if (!this.shouldDownloadMedia) {
      return ['mimetype/ignore-all-media'];
    }
    const types = process.env.WHATSAPP_FILES_MIMETYPES || '';
    return types ? types.split(',') : [];
  }

  get shouldDownloadMedia(): boolean {
    const value = process.env.WHATSAPP_DOWNLOAD_MEDIA || 'true';
    return parseBool(value);
  }

  get startSessions(): string[] {
    const value: string = process.env.WHATSAPP_START_SESSION || '';
    if (!value) {
      return [];
    }
    return value.split(',');
  }

  get shouldRestartAllSessions(): boolean {
    const value: string = process.env.WHATSAPP_RESTART_ALL_SESSIONS || 'false';
    return parseBool(value);
  }

  get proxyServer(): string[] | string | undefined {
    const single = process.env.WHATSAPP_PROXY_SERVER || undefined;
    const multipleValues = process.env.WHATSAPP_PROXY_SERVER_LIST|| undefined;
    const multiple = multipleValues ? multipleValues.split(',') : undefined;
    return single ? single : multiple;
  }

  get proxyServerIndexPrefix(): string | undefined {
    return process.env.WHATSAPP_PROXY_SERVER_INDEX_PREFIX || undefined;
  }

  get proxyServerUsername(): string | undefined {
    return process.env.WHATSAPP_PROXY_SERVER_USERNAME || undefined;
  }

  get proxyServerPassword(): string | undefined {
    return process.env.WHATSAPP_PROXY_SERVER_PASSWORD || undefined;
  }

  getWebhookConfig(): WebhookConfig | undefined {
    const url = this.getWebhookUrl();
    const events = this.getWebhookEvents();
    if (!url || events.length === 0) {
      return undefined;
    }
    return { url: url, events: events };
  }

  private getWebhookUrl(): string | undefined {
    return process.env.WHATSAPP_HOOK_URL;
  }

  private getWebhookEvents(): WAHAEvents[] {
    const value = process.env.WHATSAPP_HOOK_EVENTS || '';
    //return value ? value.split(',') : [];
    return value ? value.split(',').map(event => event as WAHAEvents) : [];

  }

  getSessionMongoUrl(): string | undefined {
    return process.env.WHATSAPP_SESSIONS_MONGO_URL || undefined;
  }

  // get(name: string, defaultValue: any = undefined): any {
  //   if (!this.configService) {
  //     return defaultValue;
  //   }
  //   return this.configService.get(name, defaultValue);
  // }

  getApiKey(): string | undefined {
    return process.env.WHATSAPP_API_KEY || '';
  }

  getExcludedPaths(): string[] {
    const value = process.env.WHATSAPP_API_KEY_EXCLUDE_PATH || '';
    if (!value) {
      return [];
    }
    return value.split(',');
  }

  getHealthMediaFilesThreshold(): number {
    const value = process.env.WHATSAPP_HEALTH_MEDIA_FILES_THRESHOLD_MB;
    return value ? parseInt(value, 10) : 100;
  }

  getHealthSessionFilesThreshold(): number {
    const value = process.env.WHATSAPP_HEALTH_SESSION_FILES_THRESHOLD_MB;
    return value ? parseInt(value, 10) : 100;
  }

  getHealthMongoTimeout(): number {
    const value = process.env.WHATSAPP_HEALTH_MONGO_TIMEOUT_MS;
    return value ? parseInt(value, 10) : 3000;
  }

  get debugModeEnabled(): boolean {
    const value = process.env.WAHA_DEBUG_MODE || 'false';
    return parseBool(value);
  }
}
