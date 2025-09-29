import { Injectable } from '@angular/core';
import { SharedAppSettings } from '../../shared/shared-app-settings';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService{
    public name : string = "default";
    public apiUrl : string = '';
    constructor(){
        this.apiUrl = SharedAppSettings.apiUrl;
    }
}

  /**
   * Loads configuration from assets/config.{env}.json
   * Must be called at app startup using APP_INITIALIZER
   */


