import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../core/config/api.config';
import { ApiResponse } from '../../core/models/api-response.model';
import { CreateUserDto, UpdateUserDto, UserDto } from '../../interfaces/user.interface';
import { User } from '../../auth/user.model';
import { Employee } from '../../interfaces/employee.interface';
import { AuthService } from '../../auth/auth.service';
import { AppConfigService } from '../service/app-config.service';
import { Organization } from '@/interfaces/organization.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public apiUrl: string;
  public baseApiUrl: string;

  constructor(private http: HttpClient, private appConfig: AppConfigService, private authService: AuthService) {
    this.apiUrl = this.appConfig.apiUrl + '/api/users';
    this.baseApiUrl = this.appConfig.apiUrl + '/api';

  }

  /** helper to get headers dynamically */
  private get headers() {
    return { headers: this.authService.getHeaders() };
  }

  // Get all users
  getAll(): Observable<ApiResponse<UserDto[]>> {
    return this.http.get<ApiResponse<UserDto[]>>(this.apiUrl, this.headers);
  }

  // Get user by id
  getById(id: string): Observable<ApiResponse<UserDto>> {
    return this.http.get<ApiResponse<UserDto>>(`${this.apiUrl}/${id}`, this.headers);
  }

  // Create a new user
  create(dto: CreateUserDto): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.apiUrl, dto, this.headers);
  }

  // Update an existing user
  update(dto: UpdateUserDto): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(this.apiUrl, dto, this.headers);
  }

  // Delete a user by id
  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`, this.headers);
  }

  // Alias (if component uses deleteUser)
  deleteUser(id: string): Observable<ApiResponse<boolean>> {
    return this.delete(id);
  }

  // Get employees
  getEmployees(): Observable<ApiResponse<Employee[]>> {
    return this.http.get<ApiResponse<Employee[]>>(`${this.baseApiUrl}/Employee`, this.headers);
  }

  getOrganizations(): Observable<ApiResponse<Organization[]>> {
    return this.http.get<ApiResponse<Organization[]>>(`${this.baseApiUrl}/Lookup/Organization`);
  }

}
