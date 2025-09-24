// employee-reporting-manager-create.dto.ts
export interface EmployeeReportingManagerCreateDto {
  employeeIds: number[]; // list of employees (for batch assignment)
  reportingManagerId: number;
  level: number;
  conflictResolution?: ManagerConflictResolution; // optional, default = Ignore
}

// employee-reporting-manager-update.dto.ts
export interface EmployeeReportingManagerUpdateDto {
  employeeIds: number[];
  reportingManagerId: number;
  level: number;
  managerConflictResolution :ManagerConflictResolution;
}

// employee-reporting-manager.dto.ts
export interface EmployeeReportingManagerDto {
  id: number;
  employeeId: number;
  employeeName: string;
  reportingManagerId: number;
  reportingManagerName: string;
  level: number;
  startDate: string;
  endDate?: string | null;
}

// reporting-manager-lookup.dto.ts
export interface ReportingManagerLookupDto {
  id: number;
  name: string;
}

export interface EmployeeFilterDto {
  CompanyId?: number;
  DepartmentId?: number;
  ReportingManagerId?: number;
}

// conflict-resolution-strategy.enum.ts
export enum ManagerConflictResolution {
  Ignore = 1,        // Do nothing - allow multiple managers at same level
  Continue = 2,      // Force adding - keep both managers as they are
  Replace = 3,       // Change old manager and set end date of old report manager
  LevelUp = 4,       // If both at L2 then new one is L2 and old one becomes L3
  LevelDown = 5      // If both at L2 then new one is L2 and old one becomes L1
}

export interface EmployeeList {
  id: number;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  designationName: string;  // will be "N/A" if null
  reportingManagers: ManagerInfo[];
}

export interface ManagerInfo
 {
     level : number;
     name : string;
 }
