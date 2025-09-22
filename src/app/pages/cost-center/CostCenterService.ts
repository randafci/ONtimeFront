import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateCostCenter, EditCostCenter, CostCenter } from '@/interfaces/cost-center.interface';
import { AuthService } from '@/auth/auth.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class CostCenterService {
  public apiUrl: string;
  
  constructor(
    private http: HttpClient, 
    private appConfig: AppConfigService,
    private authService: AuthService
  ) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
  }

  private get headers() {
    return { headers: this.authService.getHeaders() };
  }

  getAllCostCenters(): Observable<ApiResponse<CostCenter[]>> {
    return this.http.get<ApiResponse<CostCenter[]>>(`${this.apiUrl}/Lookup/CostCenter`, this.headers);
  }

  createCostCenter(data: CreateCostCenter): Observable<ApiResponse<CostCenter>> {
    return this.http.post<ApiResponse<CostCenter>>(`${this.apiUrl}/Lookup/CostCenter`, data, this.headers);
  }

  getCostCenterById(id: number): Observable<ApiResponse<CostCenter>> {
    return this.http.get<ApiResponse<CostCenter>>(`${this.apiUrl}/Lookup/CostCenter/${id}`, this.headers);
  }

  updateCostCenter(data: EditCostCenter): Observable<ApiResponse<CostCenter>> {
    return this.http.put<ApiResponse<CostCenter>>(
      `${this.apiUrl}/Lookup/CostCenter/${data.id}`,
      {
        code: data?.code,
        name: data?.name,
        nameSE: data?.nameSE,
        organizationId: data?.organizationId
      }, 
      this.headers
    );
  }

  searchCostCenters(searchText: string): Observable<ApiResponse<CostCenter[]>> {
    return this.http.get<ApiResponse<CostCenter[]>>(`${this.apiUrl}/Lookup/CostCenter/search?searchText=${searchText}`, this.headers);
  }

  deleteCostCenter(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/Lookup/CostCenter/${id}`, this.headers);
  }
}
