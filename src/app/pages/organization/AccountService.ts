// services/account.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';

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
   public apiUrl: string;
   constructor(private http: HttpClient, private appConfig: AppConfigService) {
     this.apiUrl = this.appConfig.apiUrl + '/api';
   }

  getAllAdmins(): Observable<ApiResponse<AdminUser>> {
    return this.http.get<ApiResponse<AdminUser>>(`${this.apiUrl}/alladmin`);
  }
}