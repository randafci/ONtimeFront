export enum LeaveRequestStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Cancelled = 4
}

export interface LeaveRequest {
  id: number;
  fromDate: string;
  toDate: string;
  requestDate: string;
  comments?: string;
  status: LeaveRequestStatus;
  leaveTypeId: number;
  employeeEmploymentId?: number;
  numberOfDays?: number;
  attachmentURL?: string;
  workflowId?: number;
  isDelete: boolean;
  fromIntegration: boolean;
  creationDate: string;
  modificationDate?: string;
  modifiedBy?: string;
  createdBy?: string;
  
  // Display properties
  employeeName?: string;
  leaveTypeName?: string;
  workflowName?: string;
  statusDisplayName?: string;
}

export interface CreateLeaveRequest {
  fromDate: string;
  toDate: string;
  comments?: string;
  leaveTypeId: number;
  employeeEmploymentId?: number;
  attachmentURL?: string;
  workflowId?: number;
}

export interface UpdateLeaveRequest {
  fromDate: string;
  toDate: string;
  comments?: string;
  leaveTypeId: number;
  employeeEmploymentId?: number;
  attachmentURL?: string;
  workflowId?: number;
}

export interface UpdateLeaveRequestStatus {
  status: LeaveRequestStatus;
  comments?: string;
}
