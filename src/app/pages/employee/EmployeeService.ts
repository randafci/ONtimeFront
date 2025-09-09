import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateEmployee, EditEmployee, Employee } from '@/interfaces/employee.interface';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '@/pages/service/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  public apiUrl: string;
  constructor(private http: HttpClient, private appConfig: AppConfigService) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
  }

  getAllEmployees(): Observable<ApiResponse<Employee[]>> {
    return this.http.get<ApiResponse<Employee[]>>(`${this.apiUrl}/Employee`);
  }

  getEmployeeById(id: number): Observable<ApiResponse<Employee>> {
    return this.http.get<ApiResponse<Employee>>(`${this.apiUrl}/Employee/${id}`);
  }

  createEmployee(data: CreateEmployee): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(`${this.apiUrl}/Employee`, data);
  }

  updateEmployee(id: number, data: any): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(`${this.apiUrl}/Employee/${id}`, data);
  }



  deleteEmployee(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/Employee/${id}`);
  }
}
