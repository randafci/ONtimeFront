import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '@/pages/service/app-config.service';
import { AuthService } from '@/auth/auth.service';
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
    constructor(private http: HttpClient, private appConfig: AppConfigService,private authService: AuthService) {
      this.apiUrl = this.appConfig.apiUrl + '/api';
    }
      private get headers() {
    return { headers: this.authService.getHeaders() };
  }

  getAllCompanies(): Observable<ApiResponse<LookupItem[]>> {
    return this.http.get<ApiResponse<LookupItem[]>>(`${this.apiUrl}/Lookup/Company`,this.headers);
  }

  getAllDepartments(): Observable<ApiResponse<LookupItem[]>> {
    return this.http.get<ApiResponse<LookupItem[]>>(`${this.apiUrl}/Lookup/Department`,this.headers);
  }

  getDepartmentsByCompanyId(companyId: number): Observable<ApiResponse<LookupItem[]>> {
    return this.http.get<ApiResponse<LookupItem[]>>(`${this.apiUrl}/Lookup/Department/LookupItemsByParentId/${companyId}`,this.headers);
  }

  getAllSections(): Observable<ApiResponse<LookupItem[]>> {
    return this.http.get<ApiResponse<LookupItem[]>>(`${this.apiUrl}/Lookup/Section`,this.headers);
  }

  getAllDesignations(): Observable<ApiResponse<LookupItem[]>> {
    return this.http.get<ApiResponse<LookupItem[]>>(`${this.apiUrl}/Lookup/Designations`,this.headers);
  }
}
