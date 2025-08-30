import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DepartmentType } from '@/interfaces/department-type.interface';
import { AppConfigService } from '@/pages/service/app-config.service';
import { ApiResponse } from '@/core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentTypeService {
  private apiUrl = 'https://localhost:7148/api';

  constructor(private http: HttpClient) { }

  getAllDepartmentTypes(): Observable<ApiResponse<DepartmentType[]>> {
    return this.http.get<ApiResponse<DepartmentType[]>>(`${this.apiUrl}/Lookup/DepartmentType`);
  }
}
