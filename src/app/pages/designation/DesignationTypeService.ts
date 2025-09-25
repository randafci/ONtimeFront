import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DesignationType } from '@/interfaces/designation-type.interface';
import { AppConfigService } from '@/pages/service/app-config.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { AuthService } from '@/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DesignationTypeService {

  public apiUrl: string;
  constructor(private http: HttpClient, private appConfig: AppConfigService, private authService: AuthService) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
  }

  private get headers() {
    return { headers: this.authService.getHeaders() };
  }

  getAllDesignationTypes(): Observable<ApiResponse<DesignationType[]>> {
    return this.http.get<ApiResponse<DesignationType[]>>(`${this.apiUrl}/Lookup/DesignationsType`, this.headers);
  }
}
