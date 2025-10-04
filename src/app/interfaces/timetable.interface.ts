// timetable.interface.ts

export interface TimeTable {
  id: number;
  nameAr?: string;
  nameEn?: string;
  startTime?: string; // TimeSpan as string "HH:MM:SS"
  endTime?: string;   // TimeSpan as string "HH:MM:SS"
  beginIn?: string;   // TimeSpan as string "HH:MM:SS"
  beginOut?: string;  // TimeSpan as string "HH:MM:SS"
  endIn?: string;     // TimeSpan as string "HH:MM:SS"
  endOut?: string;    
  
  isActive: boolean;
  shiftHours?: string; // TimeSpan as string "HH:MM:SS"
  isWeekend: boolean;
  isNightShift: boolean;
  isPreNightShift: boolean;
  isOpenShift: boolean;
  isTrainingCourse: boolean;
  isCheckInOutRangeEnabled: boolean;
  trainingCourseExtraWorkHours?: number;
  isFromIntegration: boolean;
  
  organizationId: number;
  organizationName?: string; // For display purposes
  
  timeShifts: TimeShift[];
  
  // Audit fields
  creationDate?: string;
  modificationDate?: string;
  createdBy?: string;
  modifiedBy?: string;
}

export interface TimeShift {
  id: number;
  shiftId: number;
  timeTableId: number;
  dayNumber: number; // 1=Monday, 2=Tuesday, etc.
  
  // Display fields
  shiftName?: string;
  timeTableName?: string;
  dayName?: string;
  
  // Audit fields
  creationDate?: string;
  modificationDate?: string;
  createdBy?: string;
  modifiedBy?: string;
}

export interface CreateTimeTable {
  nameAr?: string;
  nameEn?: string;
  startTime?: string;
  endTime?: string;
  beginIn?: string;
  beginOut?: string;
  endIn?: string;
  endOut?: string;
  
  isActive: boolean;
  shiftHours?: string;
  isWeekend: boolean;
  isNightShift: boolean;
  isPreNightShift: boolean;
  isOpenShift: boolean;
  isTrainingCourse: boolean;
  isCheckInOutRangeEnabled: boolean;
  trainingCourseExtraWorkHours?: number;
  isFromIntegration: boolean;
  
  organizationId: number;
  timeShifts: Partial<TimeShift>[];
}

export interface EditTimeTable extends CreateTimeTable {
  id: number;
}

export interface UpdateTimeTable extends CreateTimeTable {
  id: number;
}

// Helper interface for form handling
export interface TimeTableFormData {
  nameAr?: string;
  nameEn?: string;
  startTime?: Date | null;
  endTime?: Date | null;
  beginIn?: Date | null;
  beginOut?: Date | null;
  endIn?: Date | null;
  endOut?: Date | null;
  
  isActive: boolean;
  isWeekend: boolean;
  isNightShift: boolean;
  isPreNightShift: boolean;
  isOpenShift: boolean;
  isTrainingCourse: boolean;
  isCheckInOutRangeEnabled: boolean;
  trainingCourseExtraWorkHours?: number;
  isFromIntegration: boolean;
  
  organizationId: number;
  timeShifts: TimeShiftFormData[];
}

export interface TimeShiftFormData {
  shiftId: number;
  dayNumber: number;
  shiftName?: string;
  dayName?: string;
}

// Dropdown option interfaces
export interface ShiftOption {
  label: string;
  value: number;
}

export interface OrganizationOption {
  label: string;
  value: number;
}

export interface DayOption {
  label: string;
  value: number;
}
