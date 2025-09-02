// services/account.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrganization, EditOrganization, Organization } from '@/interfaces/organization.interface';
import { ApiResponse } from '@/core/models/api-response.model';




import { AppConfigService } from '@/pages/service/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
   public apiUrl : string;
  constructor(private http: HttpClient,private appConfig: AppConfigService){
      this.apiUrl = this.appConfig.apiUrl+'/api';
  }


  getAllOrganizations(): Observable<ApiResponse<Organization[]>> {
    return this.http.get<ApiResponse<Organization[]>>(`${this.apiUrl}/Lookup/Organization`);
  }

createOrganization(data: CreateOrganization): Observable<ApiResponse<Organization>> {
  return this.http.post<ApiResponse<Organization>>(`${this.apiUrl}/Lookup/Organization`, data);
}

getOrganizationById(id: number): Observable<ApiResponse<Organization>> {
  return this.http.get<ApiResponse<Organization>>(`${this.apiUrl}/Lookup/Organization/${id}`);
}

updateOrganization(data: EditOrganization): Observable<ApiResponse<Organization>> {
  return this.http.put<ApiResponse<Organization>>(
    `${this.apiUrl}/Lookup/Organization/${data.id}`, 
    { name: data.name, nameSE: data.nameSE }
  );
}
}