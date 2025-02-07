//media/MediaStorageFactory.ts
import { IMediaStorage } from './IMediaStorage';
import { Logger } from 'pino';

export abstract class MediaStorageFactory {
  abstract build(logger: Logger): IMediaStorage;
}