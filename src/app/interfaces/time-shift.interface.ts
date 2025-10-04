export interface TimeShift {
  id: number;          // Optional for create
  shiftId: number;
  timeTableId: number;
  dayNumber: number;
}


export interface DaySelection {
  dayName: string;
  dayNumber: number;
  isSelected: boolean;
  isWeekend: boolean;
}
