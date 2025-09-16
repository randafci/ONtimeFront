// services/account.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrganization, EditOrganization, Organization } from '../../interfaces/organization.interface';
import { ApiResponse } from '../../core/models/api-response.model';
import { AuthService } from '@/auth/auth.service';



import { AppConfigService } from '../../pages/service/app-config.service';
import { AssignPermissionsDto, PermissionGroup } from '@/interfaces/permition.interface';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

   public apiUrl : string;
  constructor(private http: HttpClient,private appConfig: AppConfigService
    ,  private authService: AuthService
  ){
      this.apiUrl = this.appConfig.apiUrl+'/api';
  }




  getPermissionsByRoleId(id: string): Observable<ApiResponse<PermissionGroup[]>> {
    const headers = this.authService.getHeaders();
    return this.http.get<ApiResponse<PermissionGroup[]>>(
      `${this.apiUrl}/roles/${id}/permissions`,
      { headers }
    );
  }
 GetCrudPermissionsForRole(id: string): Observable<ApiResponse<PermissionGroup[]>> {
    const headers = this.authService.getHeaders();
    return this.http.get<ApiResponse<PermissionGroup[]>>(
      `${this.apiUrl}/roles/${id}/crud/permissions`,
      { headers }
    );
  }
    updatePermissions(roleId: string, permissions: PermissionGroup[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/roles/permissions`, permissions);
  }
   getRoleName(roleId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles/${roleId}`);
  }

  getExtraEmployeesViewForRole(roleId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles/${roleId}/extra-employees`);
  }

  getAllowedLeaveClausesForRole(roleId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles/${roleId}/leave-clauses`);
  }

  getAllowedPermissionClausesForRole(roleId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles/${roleId}/permission-clauses`);
  }

  getEntityPermissionForRole(roleId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles/${roleId}/entity-permission`);
  }

  // In your PermissionService
assignPermissionsToRole(assignPermissions: AssignPermissionsDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/Roles/permissions`, assignPermissions);
}
}