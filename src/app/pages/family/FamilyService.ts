import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Family, CreateFamily, EditFamily } from '@/interfaces/family.interface';
import { AuthService } from '@/auth/auth.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class FamilyService {
  public apiUrl: string;
  
  constructor(private http: HttpClient, private appConfig: AppConfigService,
    private authService: AuthService) {
    this.apiUrl = this.appConfig.apiUrl + '/api/Lookup/Family';
  }

  private get headers() {
    return { headers: this.authService.getHeaders() };
  }

  getAllFamilies(): Observable<ApiResponse<Family[]>> {
    return this.http.get<ApiResponse<Family[]>>(this.apiUrl, this.headers);
  }

  createFamily(data: CreateFamily): Observable<ApiResponse<Family>> {
    return this.http.post<ApiResponse<Family>>(this.apiUrl, data, this.headers);
  }

  getFamilyById(id: number): Observable<ApiResponse<Family>> {
    return this.http.get<ApiResponse<Family>>(`${this.apiUrl}/${id}`, this.headers);
  }

  updateFamily(data: EditFamily): Observable<ApiResponse<Family>> {
    return this.http.put<ApiResponse<Family>>(`${this.apiUrl}/${data.id}`, data, this.headers);
  }

  deleteFamily(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`, this.headers);
  }
}