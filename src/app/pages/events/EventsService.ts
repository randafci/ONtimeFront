import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateEvents, EditEvents, Events } from '@/interfaces/events.interface';
import { AuthService } from '@/auth/auth.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  public apiUrl: string;
  
  constructor(private http: HttpClient, private appConfig: AppConfigService,
    private authService: AuthService) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
  }
  private get headers() {
    return { headers: this.authService.getHeaders() };
  }

  getAllEvents(): Observable<ApiResponse<Events[]>> {
    
    return this.http.get<ApiResponse<Events[]>>(`${this.apiUrl}/Lookup/Events`, this.headers);
  }

  createEvents(data: CreateEvents): Observable<ApiResponse<Events>> {
    return this.http.post<ApiResponse<Events>>(`${this.apiUrl}/Lookup/Events`, data, this.headers);
  }

  getEventsById(id: number): Observable<ApiResponse<Events>> {
    return this.http.get<ApiResponse<Events>>(`${this.apiUrl}/Lookup/Events/${id}`, this.headers);
  }

  updateEvents(data: EditEvents): Observable<ApiResponse<Events>> {
    return this.http.put<ApiResponse<Events>>(
      `${this.apiUrl}/Lookup/Events/${data.id}`,
      {
        code: data?.code,
        name: data?.name,
        nameSE: data?.nameSE,
        organizationId: data?.organizationId,
        start: data?.start,
        end: data?.end,
        locationId: data?.locationId
      },
      this.headers
    );
  }

  deleteEvents(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/Lookup/Events/${id}`, this.headers);
  }
}
