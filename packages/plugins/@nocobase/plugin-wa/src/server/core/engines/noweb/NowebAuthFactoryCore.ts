import { DataStore } from '../../abc/DataStore';
import { LocalStore } from '../../storage/LocalStore';
import { useMultiFileAuthState } from './useMultiFileAuthState';

export class NowebAuthFactoryCore {
  buildAuth(store: DataStore, name: string) {
    if (store instanceof LocalStore) return this.buildLocalAuth(store, name);
    throw new Error(`Unsupported store type '${store.constructor.name}'`);
  }

  protected async buildLocalAuth(store: LocalStore, name: string) {
    console.log("store name ...............................",name);
    await store.init(name);
    const authFolder = store.getSessionDirectory(name);
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    return { state, saveCreds };
  }
}
