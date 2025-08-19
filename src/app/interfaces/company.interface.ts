import { Organization } from './organization.interface';

export interface Company {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  index: number;
  parentId: number | null;
  fromIntegration: boolean;
  organizationId: number;
  isDeleted: boolean;
  creationDate: string;
  modificationDate: string | null;
  modifiedBy: string;
  createdBy: string;
  parent?: Company | null;
  children?: Company[];
  organization?: Organization | null;
  parentName?: string;
  organizationName?: string;
}

export interface CreateCompany {
  code: string;
  name: string;
  nameSE: string;
  index: number;
  parentId: number | null;
  fromIntegration: boolean;
  organizationId: number;
}

export interface EditCompany {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  index: number;
  parentId: number | null;
  fromIntegration: boolean;
  organizationId: number;
}
