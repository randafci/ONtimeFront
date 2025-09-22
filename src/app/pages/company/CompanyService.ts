import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateCompany, EditCompany, Company } from '@/interfaces/company.interface';
import { AuthService } from '@/auth/auth.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  public apiUrl: string;
  constructor(private http: HttpClient, private appConfig: AppConfigService,
    private authService: AuthService) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
  }
    private get headers() {
    return { headers: this.authService.getHeaders() };
  }
  getAllCompanies(): Observable<ApiResponse<Company[]>> {

    return this.http.get<ApiResponse<Company[]>>(`${this.apiUrl}/Lookup/Company`, this.headers );
  }

  createCompany(data: CreateCompany): Observable<ApiResponse<Company>> {
    return this.http.post<ApiResponse<Company>>(`${this.apiUrl}/Lookup/Company`, data, this.headers);
  }

  getCompanyById(id: number): Observable<ApiResponse<Company>> {
    return this.http.get<ApiResponse<Company>>(`${this.apiUrl}/Lookup/Company/${id}`, this.headers);
  }

  updateCompany(data: EditCompany): Observable<ApiResponse<Company>> {
    return this.http.put<ApiResponse<Company>>(
      `${this.apiUrl}/Lookup/Company/${data.id}`,
      {
        code: data?.code,
        name: data?.name,
        nameSE: data?.nameSE,
        parentId: data?.parentId,
        organizationId: data?.organizationId,
        companyTypeLookupId: data?.companyTypeLookupId
      }, this.headers
    );
  }

  deleteCompany(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/Lookup/Company/${id}`, this.headers);
  }
}
