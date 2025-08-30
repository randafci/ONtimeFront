// services/account.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@/core/models/api-response.model';

// interfaces/admin-user.interface.ts
export interface AdminUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
}



@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'https://localhost:7148/api/account';

  constructor(private http: HttpClient) { }

  getAllAdmins(): Observable<ApiResponse<AdminUser>> {
    return this.http.get<ApiResponse<AdminUser>>(`${this.apiUrl}/alladmin`);
  }
}