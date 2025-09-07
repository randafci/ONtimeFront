// src/app/core/services/settings.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '@/pages/service/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl: string;

  constructor(private http: HttpClient, private appConfig: AppConfigService) {
    this.apiUrl = this.appConfig.apiUrl + '/api/OrganizationSettings';
  }

  getOrgLayoutSettings(type: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${type}`);
  }
}
