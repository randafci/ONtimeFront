import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompanyType } from '@/interfaces/company-type.interface';
import { AppConfigService } from '@/pages/service/app-config.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { AuthService } from '@/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyTypeService {

  public apiUrl: string;
  constructor(private http: HttpClient, private appConfig: AppConfigService, private authService: AuthService) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
  }

  private get headers() {
    return { headers: this.authService.getHeaders() };
  }

  getAllCompanyTypes(): Observable<ApiResponse<CompanyType[]>> {
    return this.http.get<ApiResponse<CompanyType[]>>(`${this.apiUrl}/Lookup/CompanyType`, this.headers);
  }
}
