import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Device, DeviceCreate, DeviceUpdate } from './device.model';
import { AppConfigService } from '../service/app-config.service';
import { APIOperationResponse, PagedListRequest, PaginatedList } from '../../core/models/api-response.model';
import { AuthService } from '@/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private apiUrl: string;

  constructor(private http: HttpClient, private appConfig: AppConfigService, private authService: AuthService) {
    this.apiUrl = this.appConfig.apiUrl + '/api/Device';
    console.log("this.apiUrl " , this.apiUrl )
  }

  private get headers() {
    return { headers: this.authService.getHeaders() };
  }

  getDevices(request: PagedListRequest): Observable<APIOperationResponse<PaginatedList<Device>>> {
    return this.http.post<APIOperationResponse<PaginatedList<Device>>>(`${this.apiUrl}/GetAll`, request, this.headers);
  }

  getDeviceById(id: number): Observable<APIOperationResponse<Device>> {
    return this.http.get<APIOperationResponse<Device>>(`${this.apiUrl}/${id}`, this.headers);
  }

  createDevice(deviceData: DeviceCreate): Observable<APIOperationResponse<number>> {
    return this.http.post<APIOperationResponse<number>>(this.apiUrl, deviceData, this.headers);
  }

  updateDevice(id: number, deviceData: DeviceUpdate): Observable<APIOperationResponse<boolean>> {
    return this.http.put<APIOperationResponse<boolean>>(`${this.apiUrl}/${id}`, deviceData, this.headers);
  }

  deleteDevice(id: number): Observable<APIOperationResponse<boolean>> {
    return this.http.delete<APIOperationResponse<boolean>>(`${this.apiUrl}/${id}`, this.headers);
  }
}