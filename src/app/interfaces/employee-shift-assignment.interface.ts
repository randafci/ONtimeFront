export interface EmployeeShiftAssignment {
  id: number;
  startDateTime: string;
  endDateTime?: string;
  priority: number | 'Temporary' | 'Permanent'; // Support both formats
  employeeId: number;
  shiftId: number;
  isOtShift: boolean;
  isOverwriteHolidays: boolean;
  attachmentURL?: string;
  isPunchNotRequired: boolean;
  isCurrent: boolean;
  weekdays?: (string | number)[]; // Support both formats
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
  shiftName: string;
  startDateTime: string;
  endDateTime?: string | null;
  priority: number;
  isOtShift: boolean;
  isOverwriteHolidays: boolean;
  isPunchNotRequired: boolean;
  isCurrent: boolean;
  attachmentURL?: string | null;
  weekdays: number[];
}

export interface Shift {
  id: number;
  shiftTypeId: number;
  organizationId: number;
  isDefaultShift: boolean;
  shiftTypeName?: string;
  organizationName?: string;
  
 
  name?: string; 
  nameSE?: string;
  priority?: number; 
  isDeleted?: boolean; 
}
