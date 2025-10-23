import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@/core/models/api-response.model';
import { PermissionRequest } from '@/interfaces/permission-request.interface';
import { environment } from '@/environments/environment';
import { AuthService } from '@/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionRequestService {
  private baseUrl = `${environment.apiUrl}/PermissionRequest`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAll(): Observable<ApiResponse<PermissionRequest[]>> {
    const headers = this.authService.getHeaders();
    return this.http.get<ApiResponse<PermissionRequest[]>>(this.baseUrl, { headers });
  }

  getById(id: number): Observable<ApiResponse<PermissionRequest>> {
    const headers = this.authService.getHeaders();
    return this.http.get<ApiResponse<PermissionRequest>>(`${this.baseUrl}/${id}`, { headers });
  }

  getByEmployeeId(employeeId: number): Observable<ApiResponse<PermissionRequest[]>> {
    const headers = this.authService.getHeaders();
    return this.http.get<ApiResponse<PermissionRequest[]>>(`${this.baseUrl}/employee/${employeeId}`, { headers });
  }

  create(dto: PermissionRequest): Observable<ApiResponse<PermissionRequest>> {
    const headers = this.authService.getHeaders();
    return this.http.post<ApiResponse<PermissionRequest>>(this.baseUrl, dto, { headers });
  }

  update(id: number, dto: PermissionRequest): Observable<ApiResponse<PermissionRequest>> {
    const headers = this.authService.getHeaders();
    return this.http.put<ApiResponse<PermissionRequest>>(`${this.baseUrl}/${id}`, dto, { headers });
  }

  delete(id: number): Observable<ApiResponse<boolean>> {
    const headers = this.authService.getHeaders();
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`, { headers });
  }

uploadFile(file: File): Observable<ApiResponse<string>> {
  const formData = new FormData();
  formData.append('file', file, file.name);

  // Get auth headers but remove 'Content-Type'
  const headers = this.authService.getHeaders(true);
  headers.delete('Content-Type');

  return this.http.post<ApiResponse<string>>(`${this.baseUrl}/upload`, formData, { headers });
}

}
