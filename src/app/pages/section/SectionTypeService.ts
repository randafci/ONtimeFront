import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SectionType } from '@/interfaces/section-type.interface';
import { AppConfigService } from '@/pages/service/app-config.service';
import { ApiResponse } from '@/core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class SectionTypeService {
  public apiUrl: string;
  constructor(private http: HttpClient, private appConfig: AppConfigService) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
  }

  getAllSectionTypes(): Observable<ApiResponse<SectionType[]>> {
    return this.http.get<ApiResponse<SectionType[]>>(`${this.apiUrl}/Lookup/SectionType`);
  }
}
