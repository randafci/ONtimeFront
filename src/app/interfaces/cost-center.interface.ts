import { Organization } from './organization.interface';

export interface CostCenter {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  fromIntegration: boolean;
  organizationId: number;
  isDeleted: boolean;
  creationDate: string;
  modificationDate: string | null;
  modifiedBy: string;
  createdBy: string;
  organization?: Organization | null;
  organizationName?: string;
}

export interface CreateCostCenter {
  code: string;
  name: string;
  nameSE: string;
  organizationId: number;
}

export interface EditCostCenter {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  organizationId: number;
}
