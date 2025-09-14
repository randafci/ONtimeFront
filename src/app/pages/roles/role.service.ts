import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { AuthService } from '@/auth/auth.service';
// Import the new models
import { APIOperationResponse, PaginatedList, PagedListRequest } from '@/core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';

// Use the DTO structure from the backend
export interface RoleDto {
  id: string;
  name: string;
  isDefaultRole: boolean;
  isHRRole: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  public apiUrl: string;
  public headers:HttpHeaders;
  constructor(private http: HttpClient, private appConfig: AppConfigService, private authService: AuthService) {
    this.apiUrl = this.appConfig.apiUrl + '/api/Roles';
      this.headers = this.authService.getHeaders();
  }

  getRolesWithPagination(request: PagedListRequest): Observable<APIOperationResponse<PaginatedList<RoleDto>>> {
    return this.http.post<APIOperationResponse<PaginatedList<RoleDto>>>(`${this.apiUrl}/GetRolesWithPagination`, request,{headers:this.headers});
  }

  getRoleById(id: string): Observable<APIOperationResponse<RoleDto>> {
    return this.http.get<APIOperationResponse<RoleDto>>(`${this.apiUrl}/${id}`,{headers:this.headers});
  }

  addRole(roleData: { name: string, isHRRole: boolean }): Observable<APIOperationResponse<RoleDto>> {
    return this.http.post<APIOperationResponse<RoleDto>>(this.apiUrl, roleData,{headers:this.headers});
  }

  updateRole(id: string, roleData: Partial<RoleDto>): Observable<APIOperationResponse<RoleDto>> {
    return this.http.put<APIOperationResponse<RoleDto>>(`${this.apiUrl}/${id}`, roleData,{headers:this.headers});
  }

  deleteRole(id: string): Observable<APIOperationResponse<string>> {
    return this.http.delete<APIOperationResponse<string>>(`${this.apiUrl}/${id}`,{headers:this.headers});
  }
}