import { NativeModules, NativeEventEmitter } from 'react-native';

const { LocationModule } = NativeModules;

interface LocationModuleInterface {
  startSendingLocation(token?: string | null, wsUrl?: string | null): Promise<string>;
  stopSendingLocation(): Promise<void>;
  checkIsStarted(): Promise<boolean>;
}

class LocationModuleWrapper implements LocationModuleInterface {
  private module: any;
  private eventEmitter: NativeEventEmitter | null = null;

  public isStarted = false

  constructor() {
    this.module = LocationModule;
    if (this.module) {
      this.eventEmitter = new NativeEventEmitter(this.module);
    }
  }

  async startSendingLocation(token?: string | null, wsUrl?: string | null): Promise<string> {
    if (!this.module) {
      throw new Error('BackgroudModule native module is not available');
    }
    return this.module.startSendingLocation(token, wsUrl);
  }

  async stopSendingLocation() {
    if (!this.module) {
      throw new Error('BackgroudModule native module is not available');
    }

    return this.module.stopSendingLocation()
  }

  async checkIsStarted() {
    if (!this.module) {
      throw new Error('BackgroudModule native module is not available');
    }

    return this.module.checkIsStartedLocationTaskService();
  }
}

export default new LocationModuleWrapper();