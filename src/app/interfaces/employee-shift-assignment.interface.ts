export interface EmployeeShiftAssignment {
  id: number;
  startDateTime: string;
  endDateTime?: string;
  priority: 'Temporary' | 'Permanent';
  employeeId: number;
  shiftId: number;
  isOtShift: boolean;
  isOverwriteHolidays: boolean;
  attachmentURL?: string;
  isPunchNotRequired: boolean;
  isCurrent: boolean;
  weekdays?: string[];
  shift?: {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
  };
  employeeEmployment?: {
    id: number;
    employeeId: number;
    companyName: string;
    departmentName: string;
  };
}

export interface CreateEmployeeShiftAssignment {
  employeeId: number;
  shiftId: number;
  startDateTime: string;
  endDateTime?: string;
  priority: number;
  isOtShift: boolean;
  isOverwriteHolidays: boolean;
  isPunchNotRequired: boolean;
  attachmentURL?: string;
  weekdays?: string[];
}

export interface Shift {
  id: number;
  name: string;
  nameSE: string;
  priority: number;
  isDeleted: boolean;
  organizationId: number;
}
