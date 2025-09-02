import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '@/pages/service/app-config.service';

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
    public apiUrl: string;
    constructor(private http: HttpClient, private appConfig: AppConfigService) {
      this.apiUrl = this.appConfig.apiUrl + '/api';
    }

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
