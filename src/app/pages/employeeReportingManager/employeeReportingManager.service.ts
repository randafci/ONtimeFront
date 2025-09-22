import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateEmployee, EditEmployee, Employee } from '@/interfaces/employee.interface';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '@/pages/service/app-config.service';
import { AuthService } from '@/auth/auth.service';
import { EmployeeFilterDto, EmployeeList, EmployeeReportingManagerUpdateDto, ReportingManagerLookupDto } from '@/interfaces/employeeReportingManager.interface';
import { Department } from '@/interfaces/department.interface';
import { Company } from '@/interfaces/company.interface';
@Injectable({
  providedIn: 'root'
})
export class EmployeeReportingManagerService {
  public apiUrl: string;
  constructor(private http: HttpClient, private appConfig: AppConfigService,private authService: AuthService) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
    console.log("this.apiUrl" ,this.apiUrl)
  }
  private get headers() {
    return { headers: this.authService.getHeaders() };
  }
  getAllEmployees(): Observable<ApiResponse<Employee[]>> {
    return this.http.get<ApiResponse<Employee[]>>(`${this.apiUrl}/Employee`,this.headers);
  }
  assign(dto: EmployeeReportingManagerService): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${this.apiUrl}/EmployeeReportingManager/assign`,
      dto,
      this.headers
    );
  }

  /** 🔹 Update reporting manager(s) */
  update(dto: EmployeeReportingManagerUpdateDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this.apiUrl}/EmployeeReportingManager/update`,
      dto,
      this.headers
    );
  }

  /** 🔹 Get reporting managers of a specific employee */
  getByEmployeeId(employeeId: number): Observable<ApiResponse<EmployeeReportingManagerService[]>> {
    return this.http.get<ApiResponse<EmployeeReportingManagerService[]>>(
      `${this.apiUrl}/EmployeeReportingManager/${employeeId}/reporting-managers`,
      this.headers
    );
  }

  /** 🔹 Get all reporting managers (lookup: id + name) */
  getAllReportingManagers(): Observable<ApiResponse<ReportingManagerLookupDto[]>> {
    return this.http.get<ApiResponse<ReportingManagerLookupDto[]>>(
      `${this.apiUrl}/EmployeeReportingManager/all-reporting-managers`,
      this.headers
    );
  }

   getAllDepartments(): Observable<ApiResponse<Department[]>> {
      
      return this.http.get<ApiResponse<Department[]>>(`${this.apiUrl}/Lookup/Department`, this.headers);
    }
    getAllCompanies(): Observable<ApiResponse<Company[]>> {
    
        return this.http.get<ApiResponse<Company[]>>(`${this.apiUrl}/Lookup/Company`, this.headers );
      }
  getFilteredEmployees(filter: EmployeeFilterDto): Observable<ApiResponse<EmployeeList[]>> {
    return this.http.post<ApiResponse<EmployeeList[]>>(
      `${this.apiUrl}/EmployeeReportingManager/filter-employees`,
      filter,
      this.headers
    );
  }
}
