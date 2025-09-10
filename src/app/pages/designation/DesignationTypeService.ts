import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DesignationType } from '@/interfaces/designation-type.interface';
import { AppConfigService } from '@/pages/service/app-config.service';
import { ApiResponse } from '@/core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class DesignationTypeService {

  public apiUrl: string;
  constructor(private http: HttpClient, private appConfig: AppConfigService) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
  }

  getAllDesignationTypes(): Observable<ApiResponse<DesignationType[]>> {
    return this.http.get<ApiResponse<DesignationType[]>>(`${this.apiUrl}/Lookup/DesignationsType`);
  }
}
