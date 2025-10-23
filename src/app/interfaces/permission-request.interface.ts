export interface PermissionRequest {
  id?: number;
  fromDate: Date;
  toDate: Date;
  fromTime?: string | null;
  toTime?: string | null;
  requestDate: Date;
  comments?: string | null;
  status?: string | null;
  permissionTypeId: number;
  employeeEmploymentId: number;
  permissionRequestType?: string | null;
  attachmentURL?: string | null;
  workflowId?: number | null;
  isDelete?: boolean;
  fromIntegration?: boolean | null;
  employeeName?: string | null;
  workflowName?: string | null;
}
