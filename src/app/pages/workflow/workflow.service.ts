import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PagedListRequest } from '@/core/models/api-response.model';
import { AuthService } from '@/auth/auth.service';
import { AppConfigService } from '../service/app-config.service';
import {
  Workflow,
  CreateWorkflow,
  UpdateWorkflow,
  PagedResponse,
} from '@/interfaces/workflow.interface';

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private apiUrl: string;

  constructor( private http: HttpClient, private appConfig: AppConfigService,private authService: AuthService) {
    this.apiUrl = `${this.appConfig.apiUrl}/api/Workflows`;
  }

  private get headers() {
    const headers = this.authService.getHeaders();
    return { headers };
  }


  getById(id: number): Observable<ApiResponse<Workflow>> {
    return this.http.get<ApiResponse<Workflow>>(`${this.apiUrl}/${id}`, this.headers);
  }

 getAllPaged(request: PagedListRequest): Observable<ApiResponse<PagedResponse<Workflow>>> {
  return this.http.post<ApiResponse<PagedResponse<Workflow>>>(`${this.apiUrl}/all`, request, this.headers);
}


  getAllList(): Observable<ApiResponse<Workflow[]>> {
    return this.http.get<ApiResponse<Workflow[]>>(`${this.apiUrl}/all-list`, this.headers);
  }

  create(dto: CreateWorkflow): Observable<ApiResponse<Workflow>> {
    return this.http.post<ApiResponse<Workflow>>(this.apiUrl, dto, this.headers);
  }

  update(workflowId: number, dto: UpdateWorkflow): Observable<ApiResponse<Workflow>> {
    return this.http.put<ApiResponse<Workflow>>(this.apiUrl, dto, this.headers);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, this.headers);
  }
}
