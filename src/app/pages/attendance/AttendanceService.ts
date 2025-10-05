import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../core/models/api-response.model';
import { Attendance, CreateAttendance, EditAttendance, AttendanceFilter } from '../../interfaces/attendance.interface';
import { SharedAppSettings } from '../../shared/shared-app-settings';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private baseUrl = `${SharedAppSettings.apiUrl}/api/attendance`;

  constructor(private http: HttpClient) {}

  getAllAttendance(): Observable<ApiResponse<Attendance[]>> {
    return this.http.get<ApiResponse<Attendance[]>>(`${this.baseUrl}`);
  }

  getAttendanceById(id: number): Observable<ApiResponse<Attendance>> {
    return this.http.get<ApiResponse<Attendance>>(`${this.baseUrl}/${id}`);
  }

  createAttendance(attendance: CreateAttendance): Observable<ApiResponse<Attendance>> {
    return this.http.post<ApiResponse<Attendance>>(`${this.baseUrl}`, attendance);
  }

  updateAttendance(attendance: EditAttendance): Observable<ApiResponse<Attendance>> {
    return this.http.put<ApiResponse<Attendance>>(`${this.baseUrl}/${attendance.id}`, attendance);
  }

  deleteAttendance(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
  }

  searchAttendance(filter: AttendanceFilter): Observable<ApiResponse<Attendance[]>> {
    return this.http.post<ApiResponse<Attendance[]>>(`${this.baseUrl}/search`, filter);
  }
}
