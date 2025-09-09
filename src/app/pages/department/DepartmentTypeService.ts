import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DepartmentType } from '@/interfaces/department-type.interface';
import { AppConfigService } from '@/pages/service/app-config.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepartmentTypeService {
  public apiUrl: string;
  constructor(private http: HttpClient, private appConfig: AppConfigService) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
  }

  getAllDepartmentTypes(): Observable<ApiResponse<DepartmentType[]>> {
    return this.http.get<ApiResponse<DepartmentType[]>>(`${this.apiUrl}/Lookup/DepartmentType`);
  }
}
