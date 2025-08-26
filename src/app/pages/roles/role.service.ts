import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';

// Import the new models
import { APIOperationResponse, PaginatedList, PagedListRequest } from '@/core/models/api-response.model';

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
  private readonly apiUrl = `${environment.apiUrl}/api/Roles`; // e.g., http://localhost:5001/api/Roles

  constructor(private http: HttpClient) { }

  getRolesWithPagination(request: PagedListRequest): Observable<APIOperationResponse<PaginatedList<RoleDto>>> {
    return this.http.post<APIOperationResponse<PaginatedList<RoleDto>>>(`${this.apiUrl}/GetRolesWithPagination`, request);
  }

  getRoleById(id: string): Observable<APIOperationResponse<RoleDto>> {
    return this.http.get<APIOperationResponse<RoleDto>>(`${this.apiUrl}/${id}`);
  }

  addRole(roleData: { name: string, isHRRole: boolean }): Observable<APIOperationResponse<RoleDto>> {
    return this.http.post<APIOperationResponse<RoleDto>>(this.apiUrl, roleData);
  }

  updateRole(id: string, roleData: Partial<RoleDto>): Observable<APIOperationResponse<RoleDto>> {
    return this.http.put<APIOperationResponse<RoleDto>>(`${this.apiUrl}/${id}`, roleData);
  }

  deleteRole(id: string): Observable<APIOperationResponse<string>> {
    return this.http.delete<APIOperationResponse<string>>(`${this.apiUrl}/${id}`);
  }
}