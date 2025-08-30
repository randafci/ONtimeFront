// services/account.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrganization, EditOrganization, Organization } from '@/interfaces/organization.interface';
import { ApiResponse } from '@/core/models/api-response.model';





@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private apiUrl = 'https://localhost:7148/api';

  constructor(private http: HttpClient) { }

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