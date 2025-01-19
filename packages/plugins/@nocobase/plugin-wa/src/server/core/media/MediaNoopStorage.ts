import { DOCS_URL } from '../../core/exceptions';
import { IMediaStorage, MediaData } from '../../core/media/IMediaStorage';

export class MediaNoopStorage implements IMediaStorage {
  async init() {
    return;
  }

  async save(buffer: Buffer, data: MediaData): Promise<boolean> {
    return Promise.resolve(true);
  }

  async exists(data: MediaData): Promise<boolean> {
    return false;
  }

  async getStorageData(data: MediaData) {
    const url = `Media attachment's available only in WAHA Plus version. ${DOCS_URL}`;
    return { url };
  }

  async purge() {
    return;
  }
}
