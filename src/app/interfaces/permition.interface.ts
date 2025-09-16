export interface Permission {
  isSelected: boolean;
  displayValue: string;
}

export interface PermissionGroup {
  isForReportDesinger: boolean;
    isSelected: boolean;

  category: string;
  entityName: string;
  permissionsList: Permission[];
}


// Add these to your interfaces file
export interface IOption<T = any> {
  id: T;
  name: string;
  disabled?: boolean;
  isChecked?: boolean;
  selectable?: boolean;
}

export enum EntityBaseInfo {
  Company = 0,
  Department = 1,
  Section = 2,
  Designation = 3,
  Project = 4,
  Grade = 5,
  Job = 6,
  Family = 7,
  Team = 8,
  CostCenter = 9
}

export interface LeaveTypeDetails {
  id: number;
  name: string;
}

export interface PermissionTypeDetails {
  id: number;
  name: string;
}
// Add this interface
export interface AssignPermissionsDto {
    entityId: string;
    permissionsList: string[];
}