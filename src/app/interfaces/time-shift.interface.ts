export interface TimeShift {
  id: number;
  shiftId: number;
  timeTableId: number;
  dayNumber: number; // 0=Sunday, 1=Monday, 2=Tuesday, etc. (matches .NET DayOfWeek enum)
  
  // Display fields for frontend
  shiftName?: string;
  timeTableName?: string;
  dayName?: string;
}

export interface DaySelection {
  dayName: string;
  dayNumber: number;
  isSelected: boolean;
  isWeekend: boolean;
  timeShiftId?:number;
}

// Additional interfaces for backend integration
export interface CreateTimeShift {
  shiftId: number;
  timeTableId: number;
  dayNumber: number;
}

export interface UpdateTimeShift {
  id: number;
  shiftId: number;
  timeTableId: number;
  dayNumber: number;
}

export interface GroupedTimeShift {
  id: number;           
  shiftId: number;
  timeTableId: number;
  days: TimeShift[];
}