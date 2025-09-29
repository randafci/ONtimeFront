import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@/auth/auth.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';
import { Location, CreateLocation, EditLocation } from '@/interfaces/location.interface';
import { Organization } from '@/interfaces/organization.interface';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  public apiUrl: string;

  constructor(
    private http: HttpClient,
    private appConfig: AppConfigService,
    private authService: AuthService
  ) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
  }

  getAllLocations(): Observable<ApiResponse<Location[]>> {
    const headers = this.authService.getHeaders();
    return this.http.get<ApiResponse<Location[]>>(`${this.apiUrl}/Location`, { headers });
  }

  getLocationById(id: number): Observable<ApiResponse<Location>> {
    const headers = this.authService.getHeaders();

    return this.http.get<ApiResponse<Location>>(`${this.apiUrl}/Location/${id}`, { headers });
  }

  createLocation(data: CreateLocation): Observable<ApiResponse<Location>> {
    const headers = this.authService.getHeaders();

    return this.http.post<ApiResponse<Location>>(`${this.apiUrl}/Location`, data, { headers });
  }

  updateLocation(data: EditLocation): Observable<ApiResponse<Location>> {
    const headers = this.authService.getHeaders();

    return this.http.put<ApiResponse<Location>>(`${this.apiUrl}/Location/${data.id}`, data, { headers });
  }
  deleteLocation(id: number): Observable<ApiResponse<boolean>> {
    const headers = this.authService.getHeaders();

    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/Location/${id}`, { headers });
  }

  getOrganizations(): Observable<ApiResponse<Organization[]>> {
    const headers = this.authService.getHeaders();
    return this.http.get<ApiResponse<Organization[]>>(`${this.apiUrl}/Lookup/Organization`, { headers });
  }

}
