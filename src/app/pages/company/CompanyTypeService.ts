import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompanyType } from '@/interfaces/company-type.interface';
import { AppConfigService } from '@/pages/service/app-config.service';
import { ApiResponse } from '@/core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyTypeService {
    private apiUrl = 'https://localhost:7148/api';

  constructor(private http: HttpClient) { }

  getAllCompanyTypes(): Observable<ApiResponse<CompanyType[]>> {
    return this.http.get<ApiResponse<CompanyType[]>>(`${this.apiUrl}/Lookup/CompanyType`);
  }
}
