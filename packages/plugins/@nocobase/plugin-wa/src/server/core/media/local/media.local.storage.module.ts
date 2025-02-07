//media/local/media.local.storage.module.ts
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { WhatsappConfigService } from '../../../config.service';
import { MediaLocalStorageConfig } from './MediaLocalStorageConfig';
import { MediaLocalStorageFactory } from './MediaLocalStorageFactory';
import { MediaStorageFactory } from '../MediaStorageFactory';

@Module({
  imports: [
    ServeStaticModule.forRootAsync({
      imports: [],
      extraProviders: [MediaLocalStorageConfig, WhatsappConfigService],
      inject: [MediaLocalStorageConfig],
      useFactory: (config: MediaLocalStorageConfig) => {
        return [
          {
            rootPath: config.filesFolder,
            serveRoot: config.filesUri,
          },
        ];
      },
    }),
  ],
  providers: [
    {
      provide: MediaStorageFactory,
      useClass: MediaLocalStorageFactory,
    },
    WhatsappConfigService,
    MediaLocalStorageConfig,
  ],
  exports: [MediaStorageFactory],
})
export class MediaLocalStorageModule {}