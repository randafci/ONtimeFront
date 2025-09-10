import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateDesignation, EditDesignation, Designation } from '@/interfaces/designation.interface';
import { AuthService } from '@/auth/auth.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class DesignationService {
  public apiUrl: string;
  constructor(private http: HttpClient, private appConfig: AppConfigService,
    private authService: AuthService) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
  }
  getAllDesignations(): Observable<ApiResponse<Designation[]>> {
    const headers = this.authService.getHeaders();
    return this.http.get<ApiResponse<Designation[]>>(`${this.apiUrl}/Lookup/Designations`, { headers });
  }

  createDesignation(data: CreateDesignation): Observable<ApiResponse<Designation>> {
    return this.http.post<ApiResponse<Designation>>(`${this.apiUrl}/Lookup/Designations`, data);
  }

  getDesignationById(id: number): Observable<ApiResponse<Designation>> {
    return this.http.get<ApiResponse<Designation>>(`${this.apiUrl}/Lookup/Designations/${id}`);
  }

  updateDesignation(data: EditDesignation): Observable<ApiResponse<Designation>> {
    return this.http.put<ApiResponse<Designation>>(
      `${this.apiUrl}/Lookup/Designations/${data.id}`,
      {
        code: data?.code,
        name: data?.name,
        nameSE: data?.nameSE,
        parentId: data?.parentId,
        organizationId: data?.organizationId,
        designationsTypeLookupId: data?.designationsTypeLookupId
      }
    );
  }
}
