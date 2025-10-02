import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeShiftAssignment, CreateEmployeeShiftAssignment, Shift } from '@/interfaces/employee-shift-assignment.interface';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';
import { AuthService } from '@/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeShiftAssignmentService {
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

  getAllEmployeeShiftAssignments(): Observable<ApiResponse<EmployeeShiftAssignment[]>> {
    return this.http.get<ApiResponse<EmployeeShiftAssignment[]>>(`${this.apiUrl}/EmployeeShiftAssignment`, this.headers);
  }

  getEmployeeShiftAssignmentById(id: number): Observable<ApiResponse<EmployeeShiftAssignment>> {
    return this.http.get<ApiResponse<EmployeeShiftAssignment>>(`${this.apiUrl}/EmployeeShiftAssignment/${id}`, this.headers);
  }

  getEmployeeShiftAssignmentsByEmployeeId(employeeId: number): Observable<ApiResponse<EmployeeShiftAssignment[]>> {
    return this.http.get<ApiResponse<EmployeeShiftAssignment[]>>(`${this.apiUrl}/EmployeeShiftAssignment`, this.headers);
  }

  createEmployeeShiftAssignment(data: CreateEmployeeShiftAssignment): Observable<ApiResponse<EmployeeShiftAssignment>> {
    return this.http.post<ApiResponse<EmployeeShiftAssignment>>(`${this.apiUrl}/EmployeeShiftAssignment`, data, this.headers);
  }

  updateEmployeeShiftAssignment(id: number, data: CreateEmployeeShiftAssignment): Observable<ApiResponse<EmployeeShiftAssignment>> {
    return this.http.put<ApiResponse<EmployeeShiftAssignment>>(`${this.apiUrl}/EmployeeShiftAssignment/${id}`, data, this.headers);
  }

  deleteEmployeeShiftAssignment(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/EmployeeShiftAssignment/${id}`, this.headers);
  }

  uploadShiftFile(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/EmployeeShiftAssignment/upload`, formData, this.headers);
  }

  getAllShifts(): Observable<ApiResponse<Shift[]>> {
    return this.http.get<ApiResponse<Shift[]>>(`${this.apiUrl}/Lookup/ShiftType`, this.headers);
  }
}
