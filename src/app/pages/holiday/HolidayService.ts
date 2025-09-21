import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateHoliday, EditHoliday, Holiday } from '@/interfaces/holiday.interface';
import { HolidayTypeList } from '@/interfaces/holiday-type.interface';
import { AuthService } from '@/auth/auth.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class HolidayService {
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
  
  getAllHolidays(): Observable<ApiResponse<Holiday[]>> {
    return this.http.get<ApiResponse<Holiday[]>>(`${this.apiUrl}/Holiday`, this.headers);
  }

  createHoliday(data: CreateHoliday): Observable<ApiResponse<Holiday>> {
    return this.http.post<ApiResponse<Holiday>>(`${this.apiUrl}/Holiday`, data, this.headers);
  }

  getHolidayById(id: number): Observable<ApiResponse<Holiday>> {
    return this.http.get<ApiResponse<Holiday>>(`${this.apiUrl}/Holiday/${id}`, this.headers);
  }

  updateHoliday(data: EditHoliday): Observable<ApiResponse<Holiday>> {
    return this.http.put<ApiResponse<Holiday>>(
      `${this.apiUrl}/Holiday/${data.id}`,
      {
        holidayTypeId: data.holidayTypeId,
        start: data.start,
        end: data.end,
        symbol: data.symbol
      }, 
      this.headers
    );
  }

  deleteHoliday(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/Holiday/${id}`, this.headers);
  }
}
