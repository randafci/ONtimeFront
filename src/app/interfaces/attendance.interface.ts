// Backend DTOs - Direct mapping from C# DTOs
export interface EmployeePunchDto {
  employeeId: number;
  employeeName: string;
  verifyStatus: string;
  punchType: string;
  punchDate: string; // DateTime from backend
  punchTime: string; // TimeSpan from backend
}

export interface RecordPunchRequest {
  employeeId: number;
  punchDateTime: string; // ISO string
}

export interface EmployeeLogsRequest {
  employeeId: number;
  from: string; // ISO date string
  to: string; // ISO date string
}

// Enhanced frontend interfaces
export interface Attendance {
  id?: number;
  employeeId: number;
  employeeName: string;
  punchDate: string;
  punchTime: string;
  verifyStatus: string;
  punchType: string;
  // Additional fields for better display
  displayDate?: string;
  displayTime?: string;
  statusColor?: string;
  typeColor?: string;
}

export interface CreateAttendance {
  employeeId: number;
  punchDateTime: string;
}

export interface EditAttendance {
  id: number;
  employeeId: number;
  punchDateTime: string;
}

export interface AttendanceFilter {
  employeeId?: number;
  from?: string;
  to?: string;
}

// Additional interfaces for better type safety
export interface AttendanceSearchRequest {
  employeeId: number;
  from: string;
  to: string;
}

export interface AttendanceResponse {
  succeeded: boolean;
  message?: string;
  data?: Attendance[];
  errors?: string[];
}
