import { WhatsappConfigService } from '../../../config.service';

export class MediaLocalStorageConfig {
  public filesUri = 'storage/uploads/whatsapp';

  constructor(private config: WhatsappConfigService) {}

  get filesURL(): string {
    return  `/${this.filesUri}/`;
  }

  get filesFolder(): string {
    return process.env.WHATSAPP_FILES_FOLDER || '/tmp/whatsapp-files';
  }

  get filesLifetime(): number {
    return parseInt(process.env.WHATSAPP_FILES_LIFETIME || '180');
  }
}
