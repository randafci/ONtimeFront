export interface EmployeeEmployment {
  id: number;
  employeeId: number;
  companyId: number;
  departmentId: number;
  sectionId?: number;
  designationId?: number;
  gradeId?: number;
  isSpecialNeeds: boolean;
  isCurrent: number;
  joinDate?: string;
  relieveDate?: string;
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
  sectionId?: number;
  designationId?: number;
  gradeId?: number;
  isSpecialNeeds: boolean;
  joinDate?: string;
  relieveDate?: string;
  showInReport: boolean;
  showInDashboard: boolean;
}

export interface EmployeeEmploymentSearch {
  employeeId?: number;
  isCurrent?: number;
}
