import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';

import { Geolocation } from '@ionic-native/geolocation/ngx';

import * as localForage from 'localforage';

localForage.config({
  driver: localForage.INDEXEDDB,
  name: 'myApp',
  version: 1.0,
  storeName: 'auth',
});


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ServiceWorkerModule.register((!isDevMode()?'bhb/':'') + 'ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    Geolocation
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
