import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeShiftAssignment, CreateEmployeeShiftAssignment, Shift } from '@/interfaces/employee-shift-assignment.interface';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '../service/app-config.service';
import { AuthService } from '@/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeShiftAssignmentService {
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
  private get headersforfile() {
    return { headers: this.authService.getHeaders(true) };
  }

  getAllEmployeeShiftAssignments(): Observable<ApiResponse<EmployeeShiftAssignment[]>> {
    return this.http.get<ApiResponse<EmployeeShiftAssignment[]>>(`${this.apiUrl}/EmployeeShiftAssignment`, this.headers);
  }

  getEmployeeShiftAssignmentById(id: number): Observable<ApiResponse<EmployeeShiftAssignment>> {
    return this.http.get<ApiResponse<EmployeeShiftAssignment>>(`${this.apiUrl}/EmployeeShiftAssignment/${id}`, this.headers);
  }

  getEmployeeShiftAssignmentsByEmployeeId(employeeId: number): Observable<ApiResponse<EmployeeShiftAssignment[]>> {
    return this.http.get<ApiResponse<EmployeeShiftAssignment[]>>(`${this.apiUrl}/EmployeeShiftAssignment/GetAllForEmployee/${employeeId}`, this.headers);
  }

  createEmployeeShiftAssignment(data: CreateEmployeeShiftAssignment): Observable<ApiResponse<EmployeeShiftAssignment>> {
    return this.http.post<ApiResponse<EmployeeShiftAssignment>>(`${this.apiUrl}/EmployeeShiftAssignment`, data, this.headers);
  }

  updateEmployeeShiftAssignment(id: number, data: CreateEmployeeShiftAssignment): Observable<ApiResponse<EmployeeShiftAssignment>> {
    return this.http.put<ApiResponse<EmployeeShiftAssignment>>(`${this.apiUrl}/EmployeeShiftAssignment/${id}`, data, this.headers);
  }

  deleteEmployeeShiftAssignment(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/EmployeeShiftAssignment/${id}`, this.headers);
  }

  uploadShiftFile(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
  formData.append('file', file, file.name);
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/EmployeeShiftAssignment/upload`, formData, this.headersforfile);
  }

  getAllShifts(): Observable<ApiResponse<Shift[]>> {
    return new Observable(observer => {
      this.http.get<ApiResponse<Shift[]>>(`${this.apiUrl}/Shifts/all-list`, this.headers).subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
         
            const transformedData = response.data.map((shift: any) => ({
              id: shift.id,
              shiftTypeId: shift.shiftTypeId,
              organizationId: shift.organizationId,
              isDefaultShift: shift.isDefaultShift,
              shiftTypeName: shift.shiftTypeName,
              organizationName: shift.organizationName,
         
              name: shift.shiftTypeName,
              nameSE: shift.shiftTypeName,
              priority: 0,
              isDeleted: false
            }));
            
            observer.next({
              ...response,
              data: transformedData
            });
          } else {
            observer.next(response);
          }
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }
}
