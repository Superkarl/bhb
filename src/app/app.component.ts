import { Component, OnInit } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs/operators';

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
  batteryLog: string[] = [];

  constructor(private platform: Platform,
              private swUpdate: SwUpdate) {
    this.isOnline = false;
    this.modalVersion = false;
  }

  public ngOnInit(): void {
    this._initUpdateOnlineStatus();
    this._initBattery();
    this._initModalPwa();
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

  private _initBattery(): void {
    (navigator as any)?.getBattery()?.then((battery: any) => {
      this.battery = battery;
      battery.addEventListener('chargingchange', this._updateBatteryChargeInfo.bind(this));
      battery.addEventListener('levelchange', this._updateBatteryLevelInfo.bind(this));
      battery.addEventListener('chargingtimechange', this._updateBatteryChargingInfo.bind(this));
      battery.addEventListener('dischargingtimechange', this._updateBatteryDischargingInfo.bind(this));

      this._updateBatteryChargeInfo();
      this._updateBatteryLevelInfo();
      this._updateBatteryChargingInfo();
      this._updateBatteryDischargingInfo();
    })
  }
  private _updateBatteryChargeInfo(): void {
    this.batteryLog.push('Battery charging?  ' + (this.battery.charging ? 'Yes' : 'No'));
  }
  private _updateBatteryLevelInfo(): void {
    this.batteryLog.push('Battery level: ' + (this.battery.level * 100) + '%');
  }
  private _updateBatteryChargingInfo(): void {
    this.batteryLog.push('Battery charging time: ' + this.battery.chargingTime + ' seconds');
  }
  private _updateBatteryDischargingInfo(): void {
    this.batteryLog.push('Battery discharging time: ' + this.battery.dischargingTime + ' seconds');
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
}
