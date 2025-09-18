// src/app/core/services/settings.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@/auth/auth.service';
import { AppConfigService } from '@/pages/service/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl: string;

  constructor(private http: HttpClient, private appConfig: AppConfigService ,    private authService: AuthService) {
    this.apiUrl = this.appConfig.apiUrl + '/api/OrganizationSettings';
  }


 private get headers() {
    return { headers: this.authService.getHeaders() };
  }
  
  getOrgLayoutSettings(type: number): Observable<any> {
    var headers = this.headers;
    return this.http.get<any>(`${this.apiUrl}/${type}`,headers);
  }
}
