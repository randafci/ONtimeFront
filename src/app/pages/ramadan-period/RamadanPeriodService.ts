import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateRamadanPeriod, EditRamadanPeriod, RamadanPeriod } from '@/interfaces/ramadan-period.interface';
import { AuthService } from '@/auth/auth.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class RamadanPeriodService {
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

  getAllRamadanPeriods(): Observable<ApiResponse<RamadanPeriod[]>> {
    return this.http.get<ApiResponse<RamadanPeriod[]>>(`${this.apiUrl}/Lookup/RamadanPeriod`, this.headers);
  }

  createRamadanPeriod(data: CreateRamadanPeriod): Observable<ApiResponse<RamadanPeriod>> {
    return this.http.post<ApiResponse<RamadanPeriod>>(`${this.apiUrl}/Lookup/RamadanPeriod`, data, this.headers);
  }

  getRamadanPeriodById(id: number): Observable<ApiResponse<RamadanPeriod>> {
    return this.http.get<ApiResponse<RamadanPeriod>>(`${this.apiUrl}/Lookup/RamadanPeriod/${id}`, this.headers);
  }

  updateRamadanPeriod(id: number, data: EditRamadanPeriod): Observable<ApiResponse<RamadanPeriod>> {
    return this.http.put<ApiResponse<RamadanPeriod>>(
      `${this.apiUrl}/Lookup/RamadanPeriod/${id}`,
      {
        code: data.code,
        name: data.name,
        nameSE: data.nameSE,
        start: data.start,
        end: data.end
      }, 
      this.headers
    );
  }

  deleteRamadanPeriod(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/Lookup/RamadanPeriod/${id}`, this.headers);
  }
}
