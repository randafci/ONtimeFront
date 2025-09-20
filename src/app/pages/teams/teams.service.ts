import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@/auth/auth.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';
import { Team, CreateTeam, EditTeam } from '@/interfaces/team.interface';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  public apiUrl: string;
  
  constructor(
    private http: HttpClient, 
    private appConfig: AppConfigService,
    private authService: AuthService
  ) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
  }

  private get headers() {
    return { headers: this.authService.getHeaders() };
  }

  getAllTeams(): Observable<ApiResponse<Team[]>> {
    return this.http.get<ApiResponse<Team[]>>(`${this.apiUrl}/Lookup/Teams`, this.headers);
  }

  createTeam(data: CreateTeam): Observable<ApiResponse<Team>> {
    return this.http.post<ApiResponse<Team>>(`${this.apiUrl}/Lookup/Teams`, data, this.headers);
  }

  getTeamById(id: number): Observable<ApiResponse<Team>> {
    return this.http.get<ApiResponse<Team>>(`${this.apiUrl}/Lookup/Teams/${id}`, this.headers);
  }

  updateTeam(data: EditTeam): Observable<ApiResponse<Team>> {
    return this.http.put<ApiResponse<Team>>(
      `${this.apiUrl}/Lookup/Teams/${data.id}`,
      {
        code: data?.code,
        name: data?.name,
        nameSE: data?.nameSE,
        organizationId: data?.organizationId,
      },
      this.headers
    );
  }
deleteTeam(id: number): Observable<ApiResponse<any>> {
  // First get the team by id
  return new Observable<ApiResponse<any>>(observer => {
    this.getTeamById(id).subscribe({
      next: response => {
        if (!response || !response.data) {
          observer.error('Team not found');
          return;
        }

        const teamDto = {
          code: response.data.code,
          name: response.data.name,
          nameSE: response.data.nameSE,
          organizationId: response.data.organizationId,
          isDeleted: true // enforce soft delete
        };

        this.http.delete<ApiResponse<any>>(
          `${this.apiUrl}/Lookup/Teams/${id}`,
          { 
            ...this.headers,
            body: teamDto   // 👈 pass DTO in request body
          }
        ).subscribe(observer);
      },
      error: err => observer.error(err)
    });
  });
}


}
