// services/account.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrganization, EditOrganization, Organization } from '../../interfaces/organization.interface';
import { ApiResponse } from '../../core/models/api-response.model';
import { AuthService } from '@/auth/auth.service';



import { AppConfigService } from '../../pages/service/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
   public apiUrl : string;
  constructor(private http: HttpClient,private appConfig: AppConfigService
    ,  private authService: AuthService
  ){
      this.apiUrl = this.appConfig.apiUrl+'/api';
  }


  getAllOrganizations(): Observable<ApiResponse<Organization[]>> {
        const headers = this.authService.getHeaders();

    return this.http.get<ApiResponse<Organization[]>>(`${this.apiUrl}/Lookup/Organization`,{headers});
  }

createOrganization(data: CreateOrganization): Observable<ApiResponse<Organization>> {
  const headers = this.authService.getHeaders();

  return this.http.post<ApiResponse<Organization>>(`${this.apiUrl}/Lookup/Organization`, data,{headers});
}

getOrganizationById(id: number): Observable<ApiResponse<Organization>> {
    const headers = this.authService.getHeaders();

  return this.http.get<ApiResponse<Organization>>(`${this.apiUrl}/Lookup/Organization/${id}`,{headers});
}

updateOrganization(data: EditOrganization): Observable<ApiResponse<Organization>> {
    const headers = this.authService.getHeaders();

  return this.http.put<ApiResponse<Organization>>(
    `${this.apiUrl}/Lookup/Organization/${data.id}`, 
    { name: data.name, nameSE: data.nameSE },{headers}
  );
}

deleteOrganization(id: number): Observable<ApiResponse<boolean>> {
  const headers = this.authService.getHeaders();
  return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/Lookup/Organization/${id}`, { headers });
}
}