import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateDepartment, EditDepartment, Department } from '@/interfaces/department.interface';
import { AuthService } from '@/auth/auth.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  public apiUrl: string;
  
  constructor(private http: HttpClient, private appConfig: AppConfigService,
    private authService: AuthService) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
  }
  private get headers() {
    return { headers: this.authService.getHeaders() };
  }
  getAllDepartments(): Observable<ApiResponse<Department[]>> {
    
    return this.http.get<ApiResponse<Department[]>>(`${this.apiUrl}/Lookup/Department`, this.headers);
  }

  createDepartment(data: CreateDepartment): Observable<ApiResponse<Department>> {
    return this.http.post<ApiResponse<Department>>(`${this.apiUrl}/Lookup/Department`, data, this.headers);
  }

  getDepartmentById(id: number): Observable<ApiResponse<Department>> {
    return this.http.get<ApiResponse<Department>>(`${this.apiUrl}/Lookup/Department/${id}`, this.headers);
  }

  updateDepartment(data: EditDepartment): Observable<ApiResponse<Department>> {
    return this.http.put<ApiResponse<Department>>(
      `${this.apiUrl}/Lookup/Department/${data.id}`,
      {
        code: data?.code,
        name: data?.name,
        nameSE: data?.nameSE,
        parentId: data?.parentId,
        organizationId: data?.organizationId,
        companyId: data?.companyId,
        departmentTypeLookupId: data?.departmentTypeLookupId
      }, this.headers
    );
  }
}
