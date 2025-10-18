import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveRequest, CreateLeaveRequest, UpdateLeaveRequest, UpdateLeaveRequestStatus } from '@/interfaces/leave-request.interface';
import { AuthService } from '@/auth/auth.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class LeaveRequestService {
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
  
  getAllLeaveRequests(): Observable<ApiResponse<LeaveRequest[]>> {
    return this.http.get<ApiResponse<LeaveRequest[]>>(`${this.apiUrl}/LeaveRequest`, this.headers);
  }

  getLeaveRequestById(id: number): Observable<ApiResponse<LeaveRequest>> {
    return this.http.get<ApiResponse<LeaveRequest>>(`${this.apiUrl}/LeaveRequest/${id}`, this.headers);
  }

  getLeaveRequestsByEmployeeId(employeeId: number): Observable<ApiResponse<LeaveRequest[]>> {
    return this.http.get<ApiResponse<LeaveRequest[]>>(`${this.apiUrl}/LeaveRequest/employee/${employeeId}`, this.headers);
  }

  createLeaveRequest(data: CreateLeaveRequest): Observable<ApiResponse<LeaveRequest>> {
    return this.http.post<ApiResponse<LeaveRequest>>(`${this.apiUrl}/LeaveRequest`, data, this.headers);
  }

  updateLeaveRequest(id: number, data: UpdateLeaveRequest): Observable<ApiResponse<LeaveRequest>> {
    return this.http.put<ApiResponse<LeaveRequest>>(`${this.apiUrl}/LeaveRequest/${id}`, data, this.headers);
  }

  deleteLeaveRequest(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/LeaveRequest/${id}`, this.headers);
  }

  updateLeaveRequestStatus(id: number, data: UpdateLeaveRequestStatus): Observable<ApiResponse<LeaveRequest>> {
    return this.http.patch<ApiResponse<LeaveRequest>>(`${this.apiUrl}/LeaveRequest/${id}/status`, data, this.headers);
  }
}
