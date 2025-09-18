import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateEmployee, EditEmployee, Employee } from '@/interfaces/employee.interface';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '@/pages/service/app-config.service';
import { AuthService } from '@/auth/auth.service';
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  public apiUrl: string;
  constructor(private http: HttpClient, private appConfig: AppConfigService,private authService: AuthService) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
    console.log("this.apiUrl" ,this.apiUrl)
  }
  private get headers() {
    return { headers: this.authService.getHeaders() };
  }
  getAllEmployees(): Observable<ApiResponse<Employee[]>> {
    return this.http.get<ApiResponse<Employee[]>>(`${this.apiUrl}/Employee`,this.headers);
  }

  getEmployeeById(id: number): Observable<ApiResponse<Employee>> {
    return this.http.get<ApiResponse<Employee>>(`${this.apiUrl}/Employee/${id}`,this.headers);
  }

  createEmployee(data: CreateEmployee): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(`${this.apiUrl}/Employee`, data,this.headers);
  }

  updateEmployee(id: number, data: any): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(`${this.apiUrl}/Employee/${id}`, data,this.headers);
  }



  deleteEmployee(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/Employee/${id}`,this.headers);
  }
}
