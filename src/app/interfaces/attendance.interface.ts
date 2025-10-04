export interface Attendance {
  id: number;
  staffId: number;
  punchDate: string;
  punchTime: string;
  verifyStatus: string;
  punchType: string;
  employeeName?: string;
  employeeCode?: string;
}

export interface CreateAttendance {
  staffId: number;
  punchDate: string;
  punchTime: string;
  verifyStatus: string;
  punchType: string;
}

export interface EditAttendance {
  id: number;
  staffId: number;
  punchDate: string;
  punchTime: string;
  verifyStatus: string;
  punchType: string;
}

export interface AttendanceFilter {
  staffId?: number;
  punchDate?: string;
}
