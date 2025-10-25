import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../core/models/api-response.model';
import { GeneralPolicyDto } from '../../interfaces/general-policy.interface';
import { AuthService } from '../../auth/auth.service';
import { AppConfigService } from '../service/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class GeneralPolicyService {
  public apiUrl: string;

  constructor(
    private http: HttpClient, 
    private appConfig: AppConfigService,
    private authService: AuthService
  ) {
    this.apiUrl = this.appConfig.apiUrl + '/api/GeneralPolicy';
  }

  private get headers() {
    return { headers: this.authService.getHeaders() };
  }

  // GET: api/GeneralPolicy
  getAllGeneralPolicies(): Observable<ApiResponse<GeneralPolicyDto[]>> {
    return this.http.get<ApiResponse<GeneralPolicyDto[]>>(`${this.apiUrl}`, this.headers);
  }

  // GET: api/GeneralPolicy/{id}
  getGeneralPolicyById(id: string): Observable<ApiResponse<GeneralPolicyDto>> {
    return this.http.get<ApiResponse<GeneralPolicyDto>>(`${this.apiUrl}/${id}`, this.headers);
  }
  
  // --- START OF CORRECTION ---

  // POST: api/GeneralPolicy
  createGeneralPolicy(policyDto: GeneralPolicyDto): Observable<ApiResponse<GeneralPolicyDto>> {
    return this.http.post<ApiResponse<GeneralPolicyDto>>(`${this.apiUrl}`, policyDto, this.headers);
  }

  // PUT: api/GeneralPolicy/{id} (Assuming a PUT for update)
  updateGeneralPolicy(id: string, policyDto: GeneralPolicyDto): Observable<ApiResponse<GeneralPolicyDto>> {
    return this.http.put<ApiResponse<GeneralPolicyDto>>(`${this.apiUrl}/${id}`, policyDto, this.headers);
  }
  
  // DELETE: api/GeneralPolicy/{id}
  deleteGeneralPolicy(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`, this.headers);
  }

  // POST: api/GeneralPolicy/MakeDefault/{id} (example path)
  makeDefault(id: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/MakeDefault/${id}`, {}, this.headers);
  }
  
  // --- END OF CORRECTION ---
}