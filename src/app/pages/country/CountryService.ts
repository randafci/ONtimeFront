import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateCountry, EditCountry, Country } from '../../interfaces/country.interface';
import { AuthService } from '../../auth/auth.service';
import { ApiResponse } from '../../core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  public apiUrl: string;
  
  constructor(
    private http: HttpClient, 
    private appConfig: AppConfigService,
    private authService: AuthService
  ) {
    this.apiUrl = this.appConfig.apiUrl ? this.appConfig.apiUrl + '/api' : environment.apiUrl;
  }

  private get headers() {
    return { headers: this.authService.getHeaders() };
  }

  getAllCountries(): Observable<ApiResponse<Country[]>> {
    return this.http.get<ApiResponse<Country[]>>(`${this.apiUrl}/Country`, this.headers);
  }

  createCountry(data: CreateCountry): Observable<ApiResponse<Country>> {
    return this.http.post<ApiResponse<Country>>(`${this.apiUrl}/Country`, data, this.headers);
  }

  getCountryById(id: string): Observable<ApiResponse<Country>> {
    return this.http.get<ApiResponse<Country>>(`${this.apiUrl}/Country/${id}`, this.headers);
  }

  updateCountry(data: EditCountry): Observable<ApiResponse<Country>> {
    return this.http.put<ApiResponse<Country>>(
      `${this.apiUrl}/Country/${data.id}`,
      {
        id: data?.id,
        name: data?.name,
        nameSE: data?.nameSE,
        nationality: data?.nationality,
        nationalitySEName: data?.nationalitySEName
      }, 
      this.headers
    );
  }

  deleteCountry(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/Country/${id}`, this.headers);
  }

  searchCountries(searchText: string): Observable<ApiResponse<Country[]>> {
    return this.http.get<ApiResponse<Country[]>>(`${this.apiUrl}/Country/search?searchText=${searchText}`, this.headers);
  }
}
