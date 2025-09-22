// employee-reporting-manager-create.dto.ts
export interface EmployeeReportingManagerCreateDto {
  employeeIds: number[]; // list of employees (for batch assignment)
  reportingManagerId: number;
  level: number;
  conflictResolution?: ConflictResolutionStrategy; // optional, default = Ignore
}

// employee-reporting-manager-update.dto.ts
export interface EmployeeReportingManagerUpdateDto {
  employeeIds: number[];
  reportingManagerId: number;
  level: number;
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

export interface EmployeeFilterDto
{
    CompanyId?: number;
    DepartmentId?: number;
    ReportingManagerId ?: number;
}

// conflict-resolution-strategy.enum.ts
export enum ConflictResolutionStrategy {
  Ignore = 0,
  Lower = 1,
  Higher = 2
}

export interface EmployeeList {
  id: number;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  designationName: string;  // will be "N/A" if null
  reportingManagers: string[];
}
