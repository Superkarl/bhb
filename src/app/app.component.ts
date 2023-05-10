import {Component, isDevMode, OnInit} from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs/operators';
import {AuthState} from "./@state/auth.state";
import { Geolocation } from '@ionic-native/geolocation/ngx';


export type TBatteryInfo = {
  source: string,
  machineId: string,
  charging: boolean,
  level: number,
  chargingTime: number,
  dischargingTime: number
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  isOnline: boolean;
  modalVersion: boolean;
  modalPwaEvent: any;
  modalPwaPlatform: string|undefined;
  battery: any;
  batteryLog: TBatteryInfo[] = [];
  machineId?: string | null;


  constructor(
    private platform: Platform,
    private swUpdate: SwUpdate,
    public authState: AuthState,
    private geolocation: Geolocation
  ) {
    this.isOnline = false;
    this.modalVersion = false;
    this._getMachineId();
  }

  public ngOnInit(): void {
    this._initUpdateOnlineStatus();
    this._initBattery();
    this._initModalPwa();

    this._getLocation();
  }

  updateVersion(): void {
    this.modalVersion = false;
    window.location.reload();
  }

  closeVersion(): void {
    this.modalVersion = false;
  }

  addToHomeScreen(): void {
    this.modalPwaEvent.prompt();
    this.modalPwaPlatform = undefined;
  }

  closePwa(): void {
    this.modalPwaPlatform = undefined;
  }

  private _getMachineId() {

    this.machineId = localStorage.getItem('MachineId');

    if (!this.machineId) {
      this.machineId = crypto.randomUUID();
      localStorage.setItem('MachineId', this.machineId);
    }

    this.authState.init(this.machineId);
  }

  private _initBattery(): void {
    (navigator as any)?.getBattery()?.then((battery: any) => {
      this.battery = battery;
      ['chargingchange', 'levelchange', 'chargingtimechange', 'dischargingtimechange'].forEach((t: string) => {
        battery.addEventListener(t, (event: any) => {
          this._batteryStatusMessage(t);
        });
      });

      this._batteryStatusMessage('init');
    })
  }
  private _batteryStatusMessage(source: string): void {
    this.batteryLog.push({
      source,
      machineId: this.machineId as string,
      charging: this.battery.charging,
      level: this.battery.level,
      chargingTime: this.battery.chargingTime,
      dischargingTime: this.battery.dischargingTime
    });
  }

  private _initUpdateOnlineStatus(): void {
    this._updateOnlineStatus();

    window.addEventListener('online',  this._updateOnlineStatus.bind(this));
    window.addEventListener('offline', this._updateOnlineStatus.bind(this));

    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((evt: any): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
        map((evt: any) => {
          console.info(`currentVersion=[${evt.currentVersion} | latestVersion=[${evt.latestVersion}]`);
          this.modalVersion = true;
        }),
      );
    }
  }

  private _updateOnlineStatus(): void {
    this.isOnline = window.navigator.onLine;
    console.info(`isOnline=[${this.isOnline}]`);
  }

  private _initModalPwa(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((evt: any): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
        map((evt: any) => {
          console.info(`currentVersion=[${evt.currentVersion} | latestVersion=[${evt.latestVersion}]`);
          this.modalVersion = true;
        }),
      );
    }


    if (this.platform.ANDROID) {
      window.addEventListener('beforeinstallprompt', (event: any) => {
        event.preventDefault();
        this.modalPwaEvent = event;
        this.modalPwaPlatform = 'ANDROID';
      });
    }

    if (this.platform.IOS && this.platform.SAFARI) {
      const isInStandaloneMode = ('standalone' in window.navigator) && ((<any>window.navigator)['standalone']);
      if (!isInStandaloneMode) {
        this.modalPwaPlatform = 'IOS';
      }
    }
  }

  private _getLocation() {
    this.geolocation.getCurrentPosition({enableHighAccuracy: true}).then((resp) => {

      const jens = [
        resp.coords.accuracy,
        resp.coords.altitude,
        resp.coords.altitudeAccuracy,
        resp.coords.heading,
        resp.coords.latitude,
        resp.coords.longitude,
        resp.coords.speed,
        resp.timestamp
      ];


      const objectSizeInBytes = JSON.stringify(jens);


      console.table(jens);
      console.log(objectSizeInBytes?.length);
      console.log('Latitude: ' + jens[4]);
      console.log('Longitude: ' + jens[5]);
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }
}
