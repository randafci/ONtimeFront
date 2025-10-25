import { Organization } from './organization.interface';

export interface LeaveType {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  description?: string;
  symbol: string;
  reason: string;
  isAttachmentRequired: boolean;
  isCommentRequired: boolean;
  isDeleted: boolean;
  organizationId: number;
  organizationName?: string;
}
