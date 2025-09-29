import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app.config';
import { AppComponent } from './app.component';
import axios, { AxiosResponse } from "axios";
import { environment } from "./environments/environment";

import { SharedAppSettings } from '../src/app/shared/shared-app-settings';
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/public/sw.js')
    .then(() => console.log('Service Worker Registered'))
    .catch((error) => console.error('Service Worker Registration Failed:', error));
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/public/sw.js')
    .then(() => console.log('Service Worker Registered'))
    .catch((error) => console.error('Service Worker Registration Failed:', error));
}

axios.get(`/config.${environment.name}.json`).then((result : AxiosResponse)=>{
  const config = result.data;
  SharedAppSettings.apiUrl = config['apiUrl'];
})
.catch((err)=>{
  console.log(err);
})
.finally(()=>{
  bootstrapApplication(AppComponent, appConfig).catch((err) => console.log(err)); 
})

