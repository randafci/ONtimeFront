import { Injectable } from '@angular/core';
import { SharedAppSettings } from '../../shared/shared-app-settings';
import axios from 'axios';
import { environment } from '@/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AppConfigService {
    public name: string = "default";
    public apiUrl: string = '';
    public scannerUrl: string = '';
    private configLoaded = false;

    constructor() {
        // Initialize with default values
        this.apiUrl = SharedAppSettings.apiUrl;
        this.scannerUrl = SharedAppSettings.scannerUrl;
    }

    // Method to load configuration
    loadConfig(): Promise<void> {
        return axios.get(`/config.${environment.name}.json`)
            .then((response) => {
                this.apiUrl = response.data['apiUrl'] || SharedAppSettings.apiUrl;
                this.scannerUrl = response.data['scannerUrl'] || SharedAppSettings.scannerUrl;
                this.configLoaded = true;
                
                // Update shared settings if needed
                SharedAppSettings.apiUrl = this.apiUrl;
                SharedAppSettings.scannerUrl = this.scannerUrl;
            })
            .catch((err) => {
                console.error('Failed to load configuration:', err);
                // Fall back to default values
                this.configLoaded = true;
            });
    }

    get isConfigLoaded(): boolean {
        return this.configLoaded;
    }
}