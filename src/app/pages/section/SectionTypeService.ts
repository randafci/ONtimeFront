import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SectionType } from '@/interfaces/section-type.interface';
import { AppConfigService } from '@/pages/service/app-config.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SectionTypeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllSectionTypes(): Observable<ApiResponse<SectionType[]>> {
    return this.http.get<ApiResponse<SectionType[]>>(`${this.apiUrl}/Lookup/SectionType`);
  }
}
