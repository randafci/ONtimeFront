import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../core/models/api-response.model';
import { AppConfigService } from '../../pages/service/app-config.service';
import { AuthService } from '@/auth/auth.service';
import { OverTimeRequest } from '@/interfaces/overTime.interface';


@Injectable({
  providedIn: 'root'
})
export class OverTimeRequestService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private appConfig: AppConfigService,
    private authService: AuthService
  ) {
    this.apiUrl = this.appConfig.apiUrl + '/api/OverTimeRequest';
  }

  // Get all overtime requests
  getAll(): Observable<ApiResponse<OverTimeRequest[]>> {
    const headers = this.authService.getHeaders();
    return this.http.get<ApiResponse<OverTimeRequest[]>>(this.apiUrl, { headers });
  }

  // Get overtime request by ID
  getById(id: number): Observable<ApiResponse<OverTimeRequest>> {
    const headers = this.authService.getHeaders();
    return this.http.get<ApiResponse<OverTimeRequest>>(`${this.apiUrl}/${id}`, { headers });
  }

  // Get overtime requests by employee ID
  getByEmployeeId(employeeId: number): Observable<ApiResponse<OverTimeRequest[]>> {
    const headers = this.authService.getHeaders();
    return this.http.get<ApiResponse<OverTimeRequest[]>>(`${this.apiUrl}/employee/${employeeId}`, { headers });
  }

  // Create a new overtime request
  create(dto: OverTimeRequest): Observable<ApiResponse<OverTimeRequest>> {
    const headers = this.authService.getHeaders();
    return this.http.post<ApiResponse<OverTimeRequest>>(this.apiUrl, dto, { headers });
  }

  // Update an overtime request
  update(id: number, dto: OverTimeRequest): Observable<ApiResponse<OverTimeRequest>> {
    const headers = this.authService.getHeaders();
    return this.http.put<ApiResponse<OverTimeRequest>>(`${this.apiUrl}/${id}`, dto, { headers });
  }

  // Delete an overtime request
  delete(id: number): Observable<ApiResponse<boolean>> {
    const headers = this.authService.getHeaders();
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`, { headers });
  }
}
