export interface OverTimeRequest {
  id: number;
  employeeEmploymentId: number;
  overTimeHours?: number;
  requestDate: string; // ISO string (from DateTime)
  status?: string;
  punchDate?: string;
  aOverTimeHours?: number;
  allowedOvertimeHours?: number;
  approvedOvertimeHours?: number;
  workflowId?: number;

  // Optional display fields
  employeeName?: string;
  workflowName?: string;
}
