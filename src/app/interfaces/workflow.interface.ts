export enum WorkflowType {
  Permission = 1,
  Leave = 2,
  Overtime = 3
}

export enum RequesterType {
  Employee = 1,
  Manager = 2,
  HR = 3
}

export enum ApproverType {
  DirectManager = 1,
  DepartmentManager = 2,
  HR = 3,
  SpecificEmployee = 4
}
export interface WorkflowStep {
  id: number;
  workflowId: number;
  stepOrder: number;
  approverType?: string | null;
  approverEmployeeId?: number | null;
  mustApprove: boolean;
  approvalHistories: any[]; // You can replace with a proper model later
}

export interface Workflow {
  id: number;
  workflowName: string;
  workflowType: WorkflowType;
  requesterType: RequesterType;
  organizationId: number;
  companyId: number;
  departementId: number;
  isActive: boolean;
  isDeleted: boolean;
  workflowSteps: WorkflowStep[];
}

export interface CreateWorkflow {
  workflowName: string;
  workflowType: WorkflowType;
  requesterType: RequesterType;
  organizationId: number;
  companyId: number;
  departementId: number;
  workflowSteps: WorkflowStep[];
}

export interface UpdateWorkflow extends CreateWorkflow {
  id: number;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  totalPages: number;
}
