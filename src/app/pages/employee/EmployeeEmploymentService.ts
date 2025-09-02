import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeEmployment, CreateEmployeeEmployment, EmployeeEmploymentSearch } from '@/interfaces/employee-employment.interface';
import { ApiResponse } from '@/core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeEmploymentService {
  private apiUrl = 'https://localhost:7148/api';

  constructor(private http: HttpClient) { }

  getAllEmployeeEmployments(): Observable<ApiResponse<EmployeeEmployment[]>> {
    return this.http.get<ApiResponse<EmployeeEmployment[]>>(`${this.apiUrl}/EmployeeEmployment`);
  }

  getEmployeeEmploymentById(id: number): Observable<ApiResponse<EmployeeEmployment>> {
    return this.http.get<ApiResponse<EmployeeEmployment>>(`${this.apiUrl}/EmployeeEmployment/${id}`);
  }

  getEmployeeEmploymentsByEmployeeId(employeeId: number): Observable<ApiResponse<EmployeeEmployment[]>> {
    return this.http.get<ApiResponse<EmployeeEmployment[]>>(`${this.apiUrl}/EmployeeEmployment/search?employeeId=${employeeId}`);
  }

  searchEmployeeEmployments(searchDto: EmployeeEmploymentSearch): Observable<ApiResponse<EmployeeEmployment[]>> {
    const params = new URLSearchParams();
    if (searchDto.employeeId) params.append('employeeId', searchDto.employeeId.toString());
    if (searchDto.isCurrent !== undefined) params.append('isCurrent', searchDto.isCurrent.toString());
    
    return this.http.get<ApiResponse<EmployeeEmployment[]>>(`${this.apiUrl}/EmployeeEmployment/search?${params.toString()}`);
  }

  createEmployeeEmployment(data: CreateEmployeeEmployment): Observable<ApiResponse<EmployeeEmployment>> {
    return this.http.post<ApiResponse<EmployeeEmployment>>(`${this.apiUrl}/EmployeeEmployment`, data);
  }

  updateEmployeeEmployment(data: EmployeeEmployment): Observable<ApiResponse<EmployeeEmployment>> {
    return this.http.put<ApiResponse<EmployeeEmployment>>(`${this.apiUrl}/EmployeeEmployment`, data);
  }

  deleteEmployeeEmployment(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/EmployeeEmployment/${id}`);
  }
}
