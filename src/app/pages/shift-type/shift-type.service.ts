import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { AppConfigService } from '../service/app-config.service';
import { ApiResponse } from '../../core/models/api-response.model';
import { CreateShiftType, EditShiftType, ShiftType } from '../../interfaces/shift-type.interface';

@Injectable({
  providedIn: 'root'
})
export class ShiftTypeService {
  public apiUrl: string;
  
  constructor(private http: HttpClient, private appConfig: AppConfigService,
    private authService: AuthService) {
    this.apiUrl = this.appConfig.apiUrl + '/api/Lookup/ShiftType';
  }

  private get headers() {
    return { headers: this.authService.getHeaders() };
  }

  getAllShiftTypes(): Observable<ApiResponse<ShiftType[]>> {
    return this.http.get<ApiResponse<ShiftType[]>>(this.apiUrl, this.headers);
  }

  createShiftType(data: CreateShiftType): Observable<ApiResponse<ShiftType>> {
    return this.http.post<ApiResponse<ShiftType>>(this.apiUrl, data, this.headers);
  }

  getShiftTypeById(id: number): Observable<ApiResponse<ShiftType>> {
    return this.http.get<ApiResponse<ShiftType>>(`${this.apiUrl}/${id}`, this.headers);
  }

  updateShiftType(data: EditShiftType): Observable<ApiResponse<ShiftType>> {
    return this.http.put<ApiResponse<ShiftType>>(`${this.apiUrl}/${data.id}`, data, this.headers);
  }

  deleteShiftType(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`, this.headers);
  }
}