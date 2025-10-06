import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ApiResponse } from '@/core/models/api-response.model';
import { AuthService } from '@/auth/auth.service';
import { AppConfigService } from '../service/app-config.service';
import { TimeShift, CreateTimeShift, UpdateTimeShift } from '@/interfaces/time-shift.interface';

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
  create(dto: CreateTimeShift): Observable<ApiResponse<TimeShift>> {
    return this.http.post<ApiResponse<TimeShift>>(this.apiUrl, dto, this.headers);
  }

  /** Update an existing time shift */
  update(id: number, dto: UpdateTimeShift): Observable<ApiResponse<TimeShift>> {
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
  // Real API Integration Methods
  // ----------------------------------------------

  /** 
   * Get all time tables from backend API
   */
  getAllTimeTables(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.appConfig.apiUrl}/api/TimeTable`, this.headers);
  }

  /** 
   * Get all shifts from backend API
   */
  getAllShifts(): Observable<ApiResponse<any[]>> {
    return new Observable(observer => {
      this.http.get<ApiResponse<any[]>>(`${this.appConfig.apiUrl}/api/Shifts/all-list`, this.headers).subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            // Transform backend ShiftDto to frontend Shift interface
            const transformedData = response.data.map((shift: any) => ({
              id: shift.id,
              shiftTypeId: shift.shiftTypeId,
              organizationId: shift.organizationId,
              isDefaultShift: shift.isDefaultShift,
              shiftTypeName: shift.shiftTypeName,
              organizationName: shift.organizationName,
              // Backward compatibility fields
              name: shift.shiftTypeName,
              nameSE: shift.shiftTypeName,
              priority: 0,
              isDeleted: false
            }));
            
            observer.next({
              ...response,
              data: transformedData
            });
          } else {
            observer.next(response);
          }
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }
}
