import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { ApiResponse } from '../../core/models/api-response.model';
import { 
  Attendance, 
  CreateAttendance, 
  EditAttendance, 
  AttendanceFilter,
  EmployeePunchDto,
  RecordPunchRequest,
  EmployeeLogsRequest
} from '../../interfaces/attendance.interface';
import { SharedAppSettings } from '../../shared/shared-app-settings';
import { AuthService } from '../../auth/auth.service';
import { EmployeeService } from '../employee/EmployeeService';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private baseUrl = `${SharedAppSettings.apiUrl}/api/Attendance`;

  constructor(private http: HttpClient, private authService: AuthService, private employeeService: EmployeeService) {}

  // Record a punch - matches backend POST /api/Attendance/punch
  recordPunch(request: RecordPunchRequest): Observable<ApiResponse<boolean>> {
    const headers = this.authService.getHeaders();
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/punch`, request, { headers });
  }

  // Get employee logs - matches backend GET /api/Attendance/logs
  getEmployeeLogs(request: EmployeeLogsRequest): Observable<ApiResponse<EmployeePunchDto[]>> {
    const headers = this.authService.getHeaders();
    let params = new HttpParams()
      .set('employeeId', request.employeeId.toString())
      .set('from', request.from)
      .set('to', request.to);
    
    return this.http.get<ApiResponse<EmployeePunchDto[]>>(`${this.baseUrl}/logs`, { params, headers });
  }

  // Convert EmployeePunchDto[] to Attendance[]
  private convertToAttendance(punchDtos: EmployeePunchDto[]): Attendance[] {
    return punchDtos.map((dto, index) => ({
      id: index + 1, // Generate sequential ID for frontend display
      employeeId: dto.employeeId,
      employeeName: dto.employeeName,
      punchDate: this.formatDate(dto.punchDate),
      punchTime: this.formatTime(dto.punchTime),
      verifyStatus: this.convertVerifyStatus(dto.verifyStatus),
      punchType: this.convertPunchType(dto.punchType),
      // Enhanced display fields
      displayDate: this.formatDisplayDate(dto.punchDate),
      displayTime: this.formatDisplayTime(dto.punchTime),
      statusColor: this.getStatusColor(dto.verifyStatus),
      typeColor: this.getTypeColor(dto.punchType)
    }));
  }

  // Format date to YYYY-MM-DD
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return dateString; // Return as-is if parsing fails
    }
  }

  // Format time to HH:MM:SS
  private formatTime(timeString: string): string {
    try {
      // Handle TimeSpan serialization from .NET backend
      if (timeString && timeString.includes(':')) {
        // TimeSpan is serialized as "HH:MM:SS" or "H:MM:SS"
        const parts = timeString.split(':');
        if (parts.length >= 2) {
          const hours = parts[0].padStart(2, '0');
          const minutes = parts[1].padStart(2, '0');
          const seconds = parts[2] ? parts[2].padStart(2, '0') : '00';
          return `${hours}:${minutes}:${seconds}`;
        }
        return timeString; // Return as-is if it already looks good
      } else if (timeString && typeof timeString === 'string') {
        // Handle other string formats
        return timeString;
      } else if (typeof timeString === 'number' || !isNaN(parseInt(timeString))) {
        // Convert from seconds or other numeric format
        const timeInSeconds = parseInt(timeString.toString());
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return timeString || '00:00:00'; // Return as-is if parsing fails
    } catch (error) {
      return timeString || '00:00:00'; // Return as-is if parsing fails
    }
  }

  // Convert verify status from backend format to frontend format
  private convertVerifyStatus(verifyStatus: string): string {
    switch (verifyStatus) {
      case '0': return 'Manual';
      case '1': return 'FingerPrint';
      case '2': return 'Card';
      default: return 'Manual';
    }
  }

  // Convert punch type from backend format to frontend format
  private convertPunchType(punchType: string): string {
    switch (punchType) {
      case 'CheckIn': return 'Check In';
      case 'CheckOut': return 'Check Out';
      case '1': return 'Check In';
      case '2': return 'Check Out';
      case '3': return 'Break In';
      case '4': return 'Break Out';
      default: return punchType; // Return as-is if no match
    }
  }

  // Format display date for better readability
  private formatDisplayDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  // Format display time for better readability
  private formatDisplayTime(timeString: string): string {
    try {
      if (timeString && timeString.includes(':')) {
        const parts = timeString.split(':');
        if (parts.length >= 2) {
          const hours = parseInt(parts[0]);
          const minutes = parts[1];
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const displayHours = hours % 12 || 12;
          return `${displayHours}:${minutes} ${ampm}`;
        }
      }
      return timeString;
    } catch (error) {
      return timeString;
    }
  }

  // Get color for verify status
  private getStatusColor(verifyStatus: string): string {
    switch (verifyStatus) {
      case '0': return 'warning'; // Manual
      case '1': return 'success'; // FingerPrint
      case '2': return 'info'; // Card
      default: return 'info';
    }
  }

  // Get color for punch type
  private getTypeColor(punchType: string): string {
    switch (punchType) {
      case 'CheckIn':
      case '1': return 'success';
      case 'CheckOut':
      case '2': return 'danger';
      case 'BreakIn':
      case '3': return 'warning';
      case 'BreakOut':
      case '4': return 'info';
      default: return 'info';
    }
  }

  // Frontend compatibility methods
  getAllAttendance(): Observable<ApiResponse<Attendance[]>> {
    // Get current user's employee ID from token, fallback to 1 if not found
    const employeeId = this.authService.getCurrentEmployeeId() || 1;
    
    const today = new Date();
    const fromDate = new Date(today.getFullYear(), today.getMonth(), 1); // First day of current month
    const toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month
    
    const request: EmployeeLogsRequest = {
      employeeId: employeeId,
      from: fromDate.toISOString(),
      to: toDate.toISOString()
    };
    
    // Convert EmployeePunchDto[] to Attendance[]
    return new Observable(observer => {
      this.getEmployeeLogs(request).subscribe({
        next: (response) => {
          observer.next({
            statusCode: response.statusCode,
            succeeded: response.succeeded,
            message: response.message,
            code: response.code,
            errors: response.errors,
            data: response.succeeded ? this.convertToAttendance(response.data || []) : []
          });
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  getAttendanceById(id: number): Observable<ApiResponse<Attendance>> {
    // Backend doesn't have get by ID, so we'll return empty for now
    return new Observable(observer => {
      observer.next({
        statusCode: 404,
        succeeded: false,
        message: 'Get by ID not supported by backend API',
        code: { value: 'NOT_FOUND', code: 404 },
        errors: null,
        data: null as any
      });
      observer.complete();
    });
  }

  createAttendance(attendance: CreateAttendance): Observable<ApiResponse<Attendance>> {
    const request: RecordPunchRequest = {
      employeeId: attendance.employeeId,
      punchDateTime: attendance.punchDateTime
    };
    
    // Convert the boolean response to Attendance response
    return new Observable(observer => {
      this.recordPunch(request).subscribe({
        next: (response) => {
          observer.next({
            statusCode: response.statusCode,
            succeeded: response.succeeded,
            message: response.message,
            code: response.code,
            errors: response.errors,
            data: response.succeeded ? {
              id: 0,
              employeeId: attendance.employeeId,
              employeeName: '',
              punchDate: new Date(attendance.punchDateTime).toISOString().split('T')[0],
              punchTime: new Date(attendance.punchDateTime).toTimeString().split(' ')[0],
              verifyStatus: 'Manual',
              punchType: 'Check In'
            } : null as any
          });
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  updateAttendance(attendance: EditAttendance): Observable<ApiResponse<Attendance>> {
    // Backend doesn't support update, so we'll return empty for now
    return new Observable(observer => {
      observer.next({
        statusCode: 501,
        succeeded: false,
        message: 'Update not supported by backend API',
        code: { value: 'NOT_IMPLEMENTED', code: 501 },
        errors: null,
        data: null as any
      });
      observer.complete();
    });
  }

  deleteAttendance(id: number): Observable<ApiResponse<boolean>> {
    // Backend doesn't support delete, so we'll return empty for now
    return new Observable(observer => {
      observer.next({
        statusCode: 501,
        succeeded: false,
        message: 'Delete not supported by backend API',
        code: { value: 'NOT_IMPLEMENTED', code: 501 },
        errors: null,
        data: false
      });
      observer.complete();
    });
  }

  searchAttendance(filter: AttendanceFilter): Observable<ApiResponse<Attendance[]>> {
    // If no employee is selected, return all employees' attendance data
    if (!filter.employeeId) {
      return this.getAllEmployeesAttendance();
    }
    
    // If employee is selected, get data for that specific employee
    const today = new Date();
    const fromDate = filter.from ? new Date(filter.from) : new Date(today.getFullYear(), today.getMonth(), 1);
    const toDate = filter.to ? new Date(filter.to) : new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const request: EmployeeLogsRequest = {
      employeeId: filter.employeeId,
      from: fromDate.toISOString(),
      to: toDate.toISOString()
    };
    
    // Convert EmployeePunchDto[] to Attendance[]
    return new Observable(observer => {
      this.getEmployeeLogs(request).subscribe({
        next: (response) => {
          observer.next({
            statusCode: response.statusCode,
            succeeded: response.succeeded,
            message: response.message,
            code: response.code,
            errors: response.errors,
            data: response.succeeded ? this.convertToAttendance(response.data || []) : []
          });
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  // Get attendance for a specific employee
  getAttendanceByEmployeeId(employeeId: number): Observable<ApiResponse<Attendance[]>> {
    const today = new Date();
    const fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const request: EmployeeLogsRequest = {
      employeeId: employeeId,
      from: fromDate.toISOString(),
      to: toDate.toISOString()
    };
    
    return new Observable(observer => {
      this.getEmployeeLogs(request).subscribe({
        next: (response) => {
          observer.next({
            statusCode: response.statusCode,
            succeeded: response.succeeded,
            message: response.message,
            code: response.code,
            errors: response.errors,
            data: response.succeeded ? this.convertToAttendance(response.data || []) : []
          });
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  // Get attendance for multiple employees (for admin view)
  getAllEmployeesAttendance(): Observable<ApiResponse<Attendance[]>> {
    // Get all employees first, then get their attendance data
    return new Observable(observer => {
      // First get all employees
      this.employeeService.getAllEmployees().subscribe({
        next: (employeeResponse) => {
          if (employeeResponse.succeeded && employeeResponse.data) {
            const employees = employeeResponse.data;
            // Get data for current month
            const today = new Date();
            const fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
            const toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            // Create requests for all employees
            const requests = employees.map(emp => {
              const request: EmployeeLogsRequest = {
                employeeId: emp.id,
                from: fromDate.toISOString(),
                to: toDate.toISOString()
              };
              return this.getEmployeeLogs(request);
            });
            
            // Use forkJoin to get all employee data in parallel
            forkJoin(requests).subscribe({
              next: (responses) => {
                // Combine all attendance data
                let allAttendance: any[] = [];
                let hasErrors = false;
                
                responses.forEach((response, index) => {
                  if (response.succeeded && response.data) {
                    const employeeAttendance = this.convertToAttendance(response.data);
                    allAttendance = allAttendance.concat(employeeAttendance);
                  } else {
                    hasErrors = true;
                  }
                });
                
                observer.next({
                  statusCode: 200,
                  succeeded: !hasErrors,
                  message: hasErrors ? 'Some employee attendance could not be loaded' : 'All employee attendance loaded',
                  code: { value: 'SUCCESS', code: 0 },
                  errors: hasErrors ? ['Some employees had loading errors'] : null,
                  data: allAttendance
                });
                observer.complete();
              },
              error: (error) => {
                observer.error(error);
              }
            });
          } else {
            observer.error(new Error('Failed to load employees'));
          }
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }
}
