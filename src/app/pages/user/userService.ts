import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../core/config/api.config';
import { ApiResponse } from '../../core/models/api-response.model';
import { CreateUserDto, UpdateUserDto, UserDto } from '@/interfaces/user.interface';
import { User } from '@/auth/user.model'; // Import your User model
import { Employee } from '@/interfaces/employee.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${API_CONFIG.baseUrl}/users`;

  constructor(private http: HttpClient) { }

  // Get all users
getAll(): Observable<ApiResponse<UserDto[]>>{
  return this.http.get<ApiResponse<UserDto[]>>(this.apiUrl);
}
  // Get user by id
  getById(id: string): Observable<ApiResponse<UserDto>> { // Changed to User
    return this.http.get<ApiResponse<UserDto>>(`${this.apiUrl}/${id}`);
  }

  // Create a new user
  create(dto: CreateUserDto): Observable<ApiResponse<User>> { // Changed to User
    return this.http.post<ApiResponse<User>>(this.apiUrl, dto);
  }

  // Update an existing user
  update(dto: UpdateUserDto): Observable<ApiResponse<User>> { // Changed to User
    return this.http.put<ApiResponse<User>>(this.apiUrl, dto);
  }

  // Delete a user by id - FIXED method name to match component call
  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }

  // Keep this if your component calls deleteUser instead of delete
  deleteUser(id: string): Observable<ApiResponse<boolean>> {
    return this.delete(id);
  }


  // In user.service.ts
// In user.service.ts
getEmployees(): Observable<ApiResponse<Employee[]>> {
  return this.http.get<ApiResponse<Employee[]>>(`${API_CONFIG.baseUrl}/employee`);
}
}