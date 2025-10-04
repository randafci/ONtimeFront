import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Import the new models
import { AppConfigService } from '../service/app-config.service';
import { AuthService } from '../../auth/auth.service';
import { APIOperationResponse, ApiResponse, PagedListRequest, PaginatedList } from '../../core/models/api-response.model';
import { CreateShiftDto, Shift, UpdateShiftDto } from '../../interfaces/shift.interface';


@Injectable({
  providedIn: 'root'
})
export class ShiftService {

  public apiUrl: string;
  constructor(private http: HttpClient, private appConfig: AppConfigService, private authService: AuthService) {
    this.apiUrl = this.appConfig.apiUrl + '/api/Shifts';
  }

  private get headers() {
    return { headers: this.authService.getHeaders() };
  }
   getAllShifts(): Observable<ApiResponse<Shift[]>> {
    // This assumes an endpoint `GET /api/Shifts/all-list` exists that returns the full list.
    // If your paginated endpoint can return all by default, you can use that.
    return this.http.get<ApiResponse<Shift[]>>(`${this.apiUrl}/all-list`, this.headers);
  }
  
//   POST method for paginated data if you want to keep it
  getShiftsPaginated(request: PagedListRequest): Observable<ApiResponse<PaginatedList<Shift>>> {
    return this.http.post<ApiResponse<PaginatedList<Shift>>>(`${this.apiUrl}/all`, request, this.headers);
  }

  createShift(shift: CreateShiftDto): Observable<ApiResponse<Shift>> {
    return this.http.post<ApiResponse<Shift>>(this.apiUrl, shift, this.headers);
  }

  updateShift(shift: UpdateShiftDto): Observable<ApiResponse<Shift>> {
    return this.http.put<ApiResponse<Shift>>(this.apiUrl, shift, this.headers);
  }

  deleteShift(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`, this.headers);
  }
}