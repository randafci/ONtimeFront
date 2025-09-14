import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeEmployment, CreateEmployeeEmployment, EmployeeEmploymentSearch } from '@/interfaces/employee-employment.interface';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';
import { AuthService } from '@/auth/auth.service';
@Injectable({
  providedIn: 'root'
})
export class EmployeeEmploymentService {
   public apiUrl: string;
   constructor(private http: HttpClient, private appConfig: AppConfigService,private authService: AuthService) {
     this.apiUrl = this.appConfig.apiUrl + '/api';
   }
  private get headers() {
    return { headers: this.authService.getHeaders() };
  }
  getAllEmployeeEmployments(): Observable<ApiResponse<EmployeeEmployment[]>> {
    return this.http.get<ApiResponse<EmployeeEmployment[]>>(`${this.apiUrl}/EmployeeEmployment`,this.headers);
  }

  getEmployeeEmploymentById(id: number): Observable<ApiResponse<EmployeeEmployment>> {
    return this.http.get<ApiResponse<EmployeeEmployment>>(`${this.apiUrl}/EmployeeEmployment/${id}`,this.headers);
  }

  getEmployeeEmploymentsByEmployeeId(employeeId: number): Observable<ApiResponse<EmployeeEmployment[]>> {
    return this.http.get<ApiResponse<EmployeeEmployment[]>>(`${this.apiUrl}/EmployeeEmployment/search?employeeId=${employeeId}`,this.headers);
  }

  searchEmployeeEmployments(searchDto: EmployeeEmploymentSearch): Observable<ApiResponse<EmployeeEmployment[]>> {
    const params = new URLSearchParams();
    if (searchDto.employeeId) params.append('employeeId', searchDto.employeeId.toString());
    if (searchDto.isCurrent !== undefined) params.append('isCurrent', searchDto.isCurrent.toString());
    
    return this.http.get<ApiResponse<EmployeeEmployment[]>>(`${this.apiUrl}/EmployeeEmployment/search?${params.toString()}`,this.headers);
  }

  createEmployeeEmployment(data: CreateEmployeeEmployment): Observable<ApiResponse<EmployeeEmployment>> {
    return this.http.post<ApiResponse<EmployeeEmployment>>(`${this.apiUrl}/EmployeeEmployment`, data,this.headers);
  }

  updateEmployeeEmployment(data: EmployeeEmployment): Observable<ApiResponse<EmployeeEmployment>> {
    return this.http.put<ApiResponse<EmployeeEmployment>>(`${this.apiUrl}/EmployeeEmployment`, data,this.headers);
  }

  deleteEmployeeEmployment(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/EmployeeEmployment/${id}`,this.headers);
  }
}
