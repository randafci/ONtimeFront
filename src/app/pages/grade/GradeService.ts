import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Grade, CreateGrade, EditGrade } from '@/interfaces/grade.interface';
import { AuthService } from '@/auth/auth.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class GradeService {
  public apiUrl: string;
  
  constructor(private http: HttpClient, private appConfig: AppConfigService,
    private authService: AuthService) {

    this.apiUrl = this.appConfig.apiUrl + '/api/Lookup/Grade';
  }

  private get headers() {
    return { headers: this.authService.getHeaders() };
  }

  getAllGrades(): Observable<ApiResponse<Grade[]>> {
    return this.http.get<ApiResponse<Grade[]>>(this.apiUrl, this.headers);
  }

  createGrade(data: CreateGrade): Observable<ApiResponse<Grade>> {
    return this.http.post<ApiResponse<Grade>>(this.apiUrl, data, this.headers);
  }

  getGradeById(id: number): Observable<ApiResponse<Grade>> {
    return this.http.get<ApiResponse<Grade>>(`${this.apiUrl}/${id}`, this.headers);
  }

  updateGrade(data: EditGrade): Observable<ApiResponse<Grade>> {
    return this.http.put<ApiResponse<Grade>>(`${this.apiUrl}/${data.id}`, data, this.headers);
  }

  deleteGrade(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`, this.headers);
  }
}