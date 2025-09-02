import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../core/config/api.config';
import { ApiResponse } from '../../core/models/api-response.model';
import { CreateUserDto, UpdateUserDto, UserDto } from '../../interfaces/user.interface';
import { User } from '../../auth/user.model';
import { Employee } from '../../interfaces/employee.interface';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${API_CONFIG.baseUrl}/users`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

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
    return this.http.get<ApiResponse<Employee[]>>(`${API_CONFIG.baseUrl}/Employee`, this.headers);
  }
}
