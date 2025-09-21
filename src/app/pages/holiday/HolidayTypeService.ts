import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HolidayTypeList } from '@/interfaces/holiday-type.interface';
import { AuthService } from '@/auth/auth.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class HolidayTypeService {
  public apiUrl: string;
  
  constructor(
    private http: HttpClient, 
    private appConfig: AppConfigService,
    private authService: AuthService
  ) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
  }
  
  private get headers() {
    return { headers: this.authService.getHeaders() };
  }
  
  getAllHolidayTypes(): Observable<ApiResponse<HolidayTypeList[]>> {
    return this.http.get<ApiResponse<HolidayTypeList[]>>(`${this.apiUrl}/Lookup/HolidayType`, this.headers);
  }
}
