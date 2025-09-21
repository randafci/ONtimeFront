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

  createHolidayType(data: CreateHolidayType): Observable<ApiResponse<HolidayTypeList>> {
    return this.http.post<ApiResponse<HolidayTypeList>>(`${this.apiUrl}/Lookup/HolidayType`, data, this.headers);
  }

  getHolidayTypeById(id: number): Observable<ApiResponse<HolidayTypeList>> {
    return this.http.get<ApiResponse<HolidayTypeList>>(`${this.apiUrl}/Lookup/HolidayType/${id}`, this.headers);
  }

  updateHolidayType(data: EditHolidayType): Observable<ApiResponse<HolidayTypeList>> {
    return this.http.put<ApiResponse<HolidayTypeList>>(
      `${this.apiUrl}/Lookup/HolidayType/${data.id}`,
      {
        code: data.code,
        name: data.name,
        nameSE: data.nameSE,
        organizationId: data.organizationId
      }, 
      this.headers
    );
  }

  deleteHolidayType(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/Lookup/HolidayType/${id}`, this.headers);
  }
}

export interface CreateHolidayType {
  code: string;
  name: string;
  nameSE: string;
  organizationId: number;
}

export interface EditHolidayType {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  organizationId: number;
}
