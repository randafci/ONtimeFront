export interface EmployeeEmployment {
  id: number;
  employeeId: number;
  companyId: number;
  departmentId: number;
  sectionId?: number | null;
  designationId?: number | null;
  gradeId?: number | null;
  isSpecialNeeds: boolean;
  isCurrent: number;
  joinDate?: string | null;
  relieveDate?: string | null;
  showInReport: boolean;
  showInDashboard: boolean;
  
  // Navigation properties for display
  companyName?: string;
  departmentName?: string;
  employeeName?: string;
}

export interface CreateEmployeeEmployment {
  employeeId: number;
  companyId: number;
  departmentId: number;
  sectionId?: number | null;
  designationId?: number | null;
  gradeId?: number | null;
  isSpecialNeeds: boolean;
  isCurrent?: number;
  joinDate?: string | null;
  relieveDate?: string | null;
}

export interface EmployeeEmploymentSearch {
  employeeId?: number;
  isCurrent?: number;
}
