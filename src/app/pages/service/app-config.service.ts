import { Injectable } from '@angular/core';
import { SharedAppSettings } from '../../shared/shared-app-settings';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  public name: string = environment.name || 'default';
  public apiUrl: string = '';
  public scannerUrl: string = '';
  private configLoaded = false;

  constructor() {
    // Initialize with defaults in case config.json is not found
    this.apiUrl = SharedAppSettings.apiUrl;
    this.scannerUrl = SharedAppSettings.scannerUrl;
  }

  /**
   * Loads configuration from assets/config.{env}.json
   * Must be called at app startup using APP_INITIALIZER
   */
  async loadConfig(): Promise<void> {
    try {
      const response = await fetch(`/assets/config.${environment.name}.json`);
      if (!response.ok) throw new Error(`Failed to load config file`);
      const config = await response.json();

      this.apiUrl = config['apiUrl'] || SharedAppSettings.apiUrl;
      this.scannerUrl = config['scannerUrl'] || SharedAppSettings.scannerUrl;
      this.configLoaded = true;

      // Update shared settings globally
      SharedAppSettings.apiUrl = this.apiUrl;
      SharedAppSettings.scannerUrl = this.scannerUrl;

      console.log('✅ Config loaded:', this.apiUrl, this.scannerUrl);
    } catch (err) {
      console.error('⚠️ Failed to load configuration:', err);
      this.configLoaded = true; // mark loaded even if failed (fallback values)
    }
  }

  get isConfigLoaded(): boolean {
    return this.configLoaded;
  }
}
