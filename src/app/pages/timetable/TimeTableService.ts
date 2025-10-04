import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTimeTable, EditTimeTable, TimeTable } from '../../interfaces/timetable.interface';
import { ApiResponse } from '../../core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TimeTableService {
  public apiUrl: string;
  
  constructor(
    private http: HttpClient, 
    private appConfig: AppConfigService,
    private authService: AuthService
  ) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
    console.log("TimeTable API URL:", this.apiUrl);
  }
  
  private get headers() {
    return { headers: this.authService.getHeaders() };
  }
  
  // Get all time tables
  getAllTimeTables(): Observable<ApiResponse<TimeTable[]>> {
    return this.http.get<ApiResponse<TimeTable[]>>(`${this.apiUrl}/TimeTable`, this.headers);
  }
  
  // Get time table by ID
  getTimeTableById(id: number): Observable<ApiResponse<TimeTable>> {
    return this.http.get<ApiResponse<TimeTable>>(`${this.apiUrl}/TimeTable/${id}`, this.headers);
  }
  
  // Create new time table
  createTimeTable(data: CreateTimeTable): Observable<ApiResponse<TimeTable>> {
    return this.http.post<ApiResponse<TimeTable>>(`${this.apiUrl}/TimeTable`, data, this.headers);
  }
  
  // Update existing time table
  updateTimeTable(id: number, data: EditTimeTable): Observable<ApiResponse<TimeTable>> {
    return this.http.put<ApiResponse<TimeTable>>(`${this.apiUrl}/TimeTable/${id}`, data, this.headers);
  }
  
  // Delete time table
  deleteTimeTable(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/TimeTable/${id}`, this.headers);
  }
  
  // Get time tables by organization
  getTimeTablesByOrganization(organizationId: number): Observable<ApiResponse<TimeTable[]>> {
    return this.http.get<ApiResponse<TimeTable[]>>(`${this.apiUrl}/TimeTable/organization/${organizationId}`, this.headers);
  }
  
  // Get night shift time tables
  getNightShiftTimeTables(organizationId: number): Observable<ApiResponse<TimeTable[]>> {
    return this.http.get<ApiResponse<TimeTable[]>>(`${this.apiUrl}/TimeTable/night-shifts/${organizationId}`, this.headers);
  }
}
