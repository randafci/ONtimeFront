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
  creationDate: string;
  modificationDate: string | null;
  modifiedBy: string;
  createdBy: string;
  organization?: Organization | null;
  organizationName?: string;
}

export interface CreateLeaveType {
  code: string;
  name: string;
  nameSE: string;
  description?: string;
  symbol: string;
  reason: string;
  isAttachmentRequired: boolean;
  isCommentRequired: boolean;
  organizationId: number;
}

export interface EditLeaveType {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  description?: string;
  symbol: string;
  reason: string;
  isAttachmentRequired: boolean;
  isCommentRequired: boolean;
  organizationId: number;
}
