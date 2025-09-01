import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@/core/models/api-response.model';

export interface LookupItem {
  id: number;
  name: string;
  nameSE: string;
  isDeleted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private apiUrl = 'https://localhost:7148/api';

  constructor(private http: HttpClient) { }

  getAllCompanies(): Observable<ApiResponse<LookupItem[]>> {
    return this.http.get<ApiResponse<LookupItem[]>>(`${this.apiUrl}/Lookup/Company`);
  }

  getAllDepartments(): Observable<ApiResponse<LookupItem[]>> {
    return this.http.get<ApiResponse<LookupItem[]>>(`${this.apiUrl}/Lookup/Department`);
  }

  getDepartmentsByCompanyId(companyId: number): Observable<ApiResponse<LookupItem[]>> {
    return this.http.get<ApiResponse<LookupItem[]>>(`${this.apiUrl}/Lookup/Department/LookupItemsByParentId/${companyId}`);
  }
}
