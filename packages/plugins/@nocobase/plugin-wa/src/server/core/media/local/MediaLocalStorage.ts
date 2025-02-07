//media/local/MediaLocalStorage.ts
import { IMediaStorage, MediaData } from '../IMediaStorage';
import { SECOND } from '../../../structures/enums.dto';
import * as fsp from 'fs/promises';
import * as path from 'path';
import { Logger } from 'pino';
import * as fs from 'fs';
import * as del from 'del';
import { fileExists } from '../../../utils/files';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const writeFileAtomic = require('write-file-atomic');

/**
 * Save files locally using the filesystem
 */
export class MediaLocalStorage implements IMediaStorage {
  private readonly lifetimeMs: number;

  constructor(
    protected log: Logger,
    private filesFolder: string,
    private baseUrl: string,
    lifetimeSeconds: number,
  ) {
    this.lifetimeMs = lifetimeSeconds * SECOND;
    if (this.lifetimeMs === 0) {
      this.log.info('Files lifetime is 0, files will not be removed');
    }
  }

  async init() {
    return;
  }

  async exists(data: MediaData): Promise<boolean> {
    const filepath = this.getFullPath(data);
    return await fileExists(filepath);
  }

  public async save(buffer: Buffer, data: MediaData): Promise<boolean> {
    const filepath = this.getFullPath(data);
    const folder = path.dirname(filepath);

    console.log("file saved at",folder,filepath);
    
    await fsp.mkdir(folder, { recursive: true });
    await writeFileAtomic(filepath, buffer, (err) => {
      if (err) {
        // Handle the error properly, like logging it
        console.error('Error writing file:', err);
      } else {
        console.log('File written successfully');
      }
    });
    this.postponeRemoval(filepath);
    return true;
  }

  public async getStorageData(data: MediaData) {
    const filename = this.getKey(data);
    const url = this.baseUrl + filename;
    return { url };
  }

  async purge() {
    if (this.lifetimeMs === 0) {
      this.log.info('No need to purge files with lifetime 0');
      return;
    }

    if (fs.existsSync(this.filesFolder)) {
       // const paths = await del([`${this.filesFolder}/*`], { force: true });
       //  if (paths.length > 0) {
       //    this.log.info('Deleted files and directories:\n', paths.join('\n'));
           this.log.info('directories exists:\n', this.filesFolder);
       //  }
    } else {
      fs.mkdirSync(this.filesFolder);
      this.log.info(`Directory '${this.filesFolder}' created from scratch`);
    }
  }

  private getKey(data: MediaData) {
    return `${data.session}/${data.message.id}.${data.file.extension}`;
  }

  private getFullPath(data: MediaData) {
    const filepath = this.getKey(data);
    return path.resolve(`${this.filesFolder}/${filepath}`);
  }

  private postponeRemoval(filepath: string) {
    if (this.lifetimeMs === 0) {
      return;
    }
    setTimeout(
      () =>
        fs.unlink(filepath, () => {
          this.log.info(`File ${filepath} was removed`);
        }),
      this.lifetimeMs,
    );
  }
}