import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DepartmentType } from '@/interfaces/department-type.interface';
import { AppConfigService } from '@/pages/service/app-config.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { environment } from '@/environments/environment';
import { AuthService } from '@/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DepartmentTypeService {
  public apiUrl: string;
  constructor(private http: HttpClient, private appConfig: AppConfigService, private authService: AuthService) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
  }

  private get headers() {
    return { headers: this.authService.getHeaders() };
  }

  getAllDepartmentTypes(): Observable<ApiResponse<DepartmentType[]>> {
    return this.http.get<ApiResponse<DepartmentType[]>>(`${this.apiUrl}/Lookup/DepartmentType`, this.headers);
  }
}
