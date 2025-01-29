//media/local/MediaLocalStorageFactory.ts
import { IMediaStorage } from '../IMediaStorage';
import { MediaLocalStorage } from './MediaLocalStorage';
import { MediaLocalStorageConfig } from './MediaLocalStorageConfig';
import { MediaStorageFactory } from '../MediaStorageFactory';
import { Logger } from 'pino';

export class MediaLocalStorageFactory extends MediaStorageFactory {
  constructor(private config: MediaLocalStorageConfig) {
    super();
  }

  build(logger: Logger): IMediaStorage {
    return new MediaLocalStorage(
      logger,
      this.config.filesFolder,
      this.config.filesURL,
      this.config.filesLifetime,
    );
  }
}