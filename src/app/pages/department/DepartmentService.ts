import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateDepartment, EditDepartment, Department } from '@/interfaces/department.interface';
import { ApiResponse } from '@/core/models/api-response.model';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  // private apiUrl = 'https://localhost:44369/api';
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) { }

  getAllDepartments(): Observable<ApiResponse<Department[]>> {
    return this.http.get<ApiResponse<Department[]>>(`${this.apiUrl}/Lookup/Department`);
  }

  createDepartment(data: CreateDepartment): Observable<ApiResponse<Department>> {
    return this.http.post<ApiResponse<Department>>(`${this.apiUrl}/Lookup/Department`, data);
  }

  getDepartmentById(id: number): Observable<ApiResponse<Department>> {
    return this.http.get<ApiResponse<Department>>(`${this.apiUrl}/Lookup/Department/${id}`);
  }

  updateDepartment(data: EditDepartment): Observable<ApiResponse<Department>> {
    return this.http.put<ApiResponse<Department>>(
      `${this.apiUrl}/Lookup/Department/${data.id}`, 
      { name: data.name, nameSE: data.nameSE, companyId: data.companyId }
    );
  }
}
