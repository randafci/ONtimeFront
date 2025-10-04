import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Import the new models
import { AppConfigService } from '../service/app-config.service';
import { AuthService } from '../../auth/auth.service';
import { APIOperationResponse, PagedListRequest, PaginatedList } from '../../core/models/api-response.model';
import { RemoveUsersFromRole, UserInRole } from '../../interfaces/role-user.interface';

// Use the DTO structure from the backend
export interface RoleDto {
  id: string;
  name: string;
  isDefaultRole: boolean;
  isHRRole: boolean;  
  isSuperAdmin: boolean;
  isHRManager: boolean;
  isHRAdministrator: boolean;
  isHRSpecialist: boolean;
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

  getUsersInRole(roleId: string): Observable<APIOperationResponse<UserInRole[]>> {
    return this.http.get<APIOperationResponse<UserInRole[]>>(`${this.apiUrl}/${roleId}/users`, { headers: this.headers });
  }

  // NEW METHOD 2: Remove a list of users from a specific role
  removeUsersFromRole(roleId: string, data: RemoveUsersFromRole): Observable<APIOperationResponse<boolean>> {
    // The HTTP method for deletion can be POST, PUT, or DELETE. 
    // Since we're sending a body, DELETE is a good choice here as per your backend controller.
    return this.http.delete<APIOperationResponse<boolean>>(`${this.apiUrl}/${roleId}/users`, { headers: this.headers, body: data });
  }
}