import { WAHAHealthCheckService } from '../abc/WAHAHealthCheckService';
import { AvailableInPlusVersion } from '../exceptions';

export class WAHAHealthCheckServiceCore extends WAHAHealthCheckService {
  check(): Promise<any> {
    throw new AvailableInPlusVersion();
  }
}
