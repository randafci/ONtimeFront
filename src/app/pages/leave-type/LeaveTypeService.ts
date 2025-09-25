import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveType } from '@/interfaces/leave-type.interface';
import { AuthService } from '@/auth/auth.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class LeaveTypeService {
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
  
  getAllLeaveTypes(): Observable<ApiResponse<LeaveType[]>> {
    return this.http.get<ApiResponse<LeaveType[]>>(`${this.apiUrl}/LeaveType`, this.headers);
  }

  createLeaveType(data: CreateLeaveType): Observable<ApiResponse<LeaveType>> {
    return this.http.post<ApiResponse<LeaveType>>(`${this.apiUrl}/LeaveType`, data, this.headers);
  }

  getLeaveTypeById(id: number): Observable<ApiResponse<LeaveType>> {
    return this.http.get<ApiResponse<LeaveType>>(`${this.apiUrl}/LeaveType/${id}`, this.headers);
  }

  updateLeaveType(data: EditLeaveType): Observable<ApiResponse<LeaveType>> {
    return this.http.put<ApiResponse<LeaveType>>(
      `${this.apiUrl}/LeaveType/${data.id}`,
      {
        code: data.code,
        name: data.name,
        nameSE: data.nameSE,
        description: data.description,
        symbol: data.symbol,
        reason: data.reason,
        isAttachmentRequired: data.isAttachmentRequired,
        isCommentRequired: data.isCommentRequired,
        organizationId: data.organizationId
      }, 
      this.headers
    );
  }

  deleteLeaveType(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/LeaveType/${id}`, this.headers);
  }

  getLeaveTypesByOrganizationId(organizationId: number): Observable<ApiResponse<LeaveType[]>> {
    return this.http.get<ApiResponse<LeaveType[]>>(`${this.apiUrl}/LeaveType/organization/${organizationId}`, this.headers);
  }
}

export interface CreateLeaveType {
  code: string;
  name: string;
  nameSE: string;
  description?: string;
  symbol: string;
  reason: string;
  isAttachmentRequired: boolean;
  isCommentRequired: boolean;
  organizationId: number;
}

export interface EditLeaveType {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  description?: string;
  symbol: string;
  reason: string;
  isAttachmentRequired: boolean;
  isCommentRequired: boolean;
  organizationId: number;
}
