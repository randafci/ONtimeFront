import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ApiResponse } from '@/core/models/api-response.model';
import { AuthService } from '@/auth/auth.service';
import { AppConfigService } from '../service/app-config.service';
import { TimeShift } from '@/interfaces/time-shift.interface';

@Injectable({
  providedIn: 'root'
})
export class TimeShiftService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private appConfig: AppConfigService,
    private authService: AuthService
  ) {
    this.apiUrl = `${this.appConfig.apiUrl}/api/TimeShift`;
  }

 private get headers() {
    const headers = this.authService.getHeaders();
    console.log("headers", headers);
    return { headers };
  }

  /** Get all time shifts */
  getAll(): Observable<ApiResponse<TimeShift[]>> {
    return this.http.get<ApiResponse<TimeShift[]>>(this.apiUrl, this.headers);
  }

  /** Get time shift by ID */
  getById(id: number): Observable<ApiResponse<TimeShift>> {
    return this.http.get<ApiResponse<TimeShift>>(`${this.apiUrl}/${id}`, this.headers);
  }

  /** Create a new time shift */
  create(dto: TimeShift): Observable<ApiResponse<TimeShift>> {
    return this.http.post<ApiResponse<TimeShift>>(this.apiUrl, dto, this.headers);
  }

  /** Update an existing time shift */
  update(id: number, dto: TimeShift): Observable<ApiResponse<TimeShift>> {
    return this.http.put<ApiResponse<TimeShift>>(`${this.apiUrl}/${id}`, dto, this.headers);
  }

  /** Delete a time shift */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, this.headers);
  }

    /** Get current user's schedule */
  getUserSchedule(): Observable<ApiResponse<TimeShift[]>> {
    return this.http.get<ApiResponse<TimeShift[]>>(`${this.apiUrl}/me/schedule`, this.headers);
  }
  // ----------------------------------------------
  // 🧠 Dummy Data Examples (to be replaced by APIs)
  // ----------------------------------------------

  /** 
   * Get all time tables (dummy data) 
   */
  getAllTimeTables(): Observable<ApiResponse<any[]>> {
    const dummyData = [
      { id: 1, name: 'Morning Table', startTime: '08:00', endTime: '16:00' },
      { id: 2, name: 'Evening Table', startTime: '16:00', endTime: '00:00' },
      { id: 3, name: 'Night Table', startTime: '00:00', endTime: '08:00' }
    ];

    const response: ApiResponse<any[]> = {
        statusCode: 200,
        succeeded: true,
        message: 'Dummy time tables loaded successfully',
        data: dummyData,
        code: {
            value: '',
            code: 0
        },
        errors: undefined
    };

    return of(response);
  }

  /** 
   * Get all shifts (dummy data) 
   */
  getAllShifts(): Observable<ApiResponse<any[]>> {
    const dummyData = [
      { id: 1, name: 'Shift A', description: 'Day Shift' },
      { id: 2, name: 'Shift B', description: 'Night Shift' },
      { id: 3, name: 'Shift C', description: 'Weekend Shift' }
    ];

    const response: ApiResponse<any[]> = {
        statusCode: 200,
        succeeded: true,
        message: 'Dummy shifts loaded successfully',
        data: dummyData,
        code: {
            value: '',
            code: 0
        },
        errors: undefined
    };

    return of(response);
  }
}
