import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateSection, EditSection, Section } from '@/interfaces/section.interface';
import { ApiResponse } from '@/core/models/api-response.model';
import { environment } from '@/environments/environment';
import { AppConfigService } from '../service/app-config.service';
import { AuthService } from '@/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SectionService {
private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private appConfig: AppConfigService,
    private authService: AuthService) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
  }

  getAllSections(): Observable<ApiResponse<Section[]>> {
    const headers = this.authService.getHeaders();
    return this.http.get<ApiResponse<Section[]>>(`${this.apiUrl}/Lookup/Section`, { headers });
  }

  createSection(data: CreateSection): Observable<ApiResponse<Section>> {
    const headers = this.authService.getHeaders();
    return this.http.post<ApiResponse<Section>>(`${this.apiUrl}/Lookup/Section`, data, { headers });
  }

  getSectionById(id: number): Observable<ApiResponse<Section>> {
    const headers = this.authService.getHeaders();
    return this.http.get<ApiResponse<Section>>(`${this.apiUrl}/Lookup/Section/${id}`, { headers });
  }

  updateSection(data: EditSection): Observable<ApiResponse<Section>> {
    const headers = this.authService.getHeaders();
    return this.http.put<ApiResponse<Section>>(
      `${this.apiUrl}/Lookup/Section/${data?.id}`, 
      { 
        code: data?.code,
        name: data?.name,
        nameSE: data?.nameSE,
        parentId: data?.parentId,
        organizationId: data?.organizationId,
        companyId: data?.companyId,
        sectionTypeLookupId: data?.sectionTypeLookupId,
       },
       { headers }
    );
  }

  deleteSection(id: number): Observable<ApiResponse<boolean>> {
    const headers = this.authService.getHeaders();
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/Lookup/Section/${id}`, { headers });
  }
}
