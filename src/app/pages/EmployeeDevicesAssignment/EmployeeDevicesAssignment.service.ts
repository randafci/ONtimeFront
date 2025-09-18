import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '@/pages/service/app-config.service';
import { AuthService } from '@/auth/auth.service';
import { EmployeeDeviceAssignmentCreateDto, EmployeeDeviceAssignment, EmployeeDeviceAssignmentEditDto } from '@/interfaces/EemployeeDeviceAssignment.interface';
import { DeviceService } from '../device/device.service';


@Injectable({
  providedIn: 'root'
})
export class EmployeeDevicesAssignmentService {
  public apiUrl: string;

  constructor(
    private http: HttpClient, 
    private appConfig: AppConfigService,
    private authService: AuthService,
  ) {
    this.apiUrl = this.appConfig.apiUrl + '/api/EmployeeDevicesAssignment';
  }

  private get headers() {
    return { headers: this.authService.getHeaders() };
  }

  assignDevice(createDto: EmployeeDeviceAssignmentCreateDto): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/device/assign`, 
      createDto, 
      this.headers
    );
  }

  getEmployeeDevices(employeeId: number): Observable<ApiResponse<EmployeeDeviceAssignment[]>> {
    return this.http.get<ApiResponse<EmployeeDeviceAssignment[]>>(
      `${this.apiUrl}/${employeeId}/devices`, 
      this.headers
    );
  }

  deleteEmployeeDevice(employeeId: number, deviceId: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(
      `${this.apiUrl}?employeeId=${employeeId}&deviceId=${deviceId}`, 
      this.headers
    );
  }

  editAssignedDevice(editDto: EmployeeDeviceAssignmentEditDto): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/device/update`, 
      editDto, 
      this.headers
    );
  }

  getAllDevices(request: any): Observable<ApiResponse<any>> {
  return this.http.post<ApiResponse<any>>(
    `${this.appConfig.apiUrl}/api/Device/GetAll`,
    request,
    this.headers
  );
}


}