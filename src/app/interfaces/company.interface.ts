import { Organization } from './organization.interface';

export interface Company {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  parentId: number | null;
  organizationId: number;
  isDeleted: boolean;
  creationDate: string;
  modificationDate: string | null;
  modifiedBy: string;
  createdBy: string;
  companyTypeLookupId?: number | null;
  parent?: Company | null;
  children?: Company[];
  organization?: Organization | null;
  parentName?: string;
  organizationName?: string;
  companyTypeName?: string;
}

export interface CreateCompany {
  code: string;
  name: string;
  nameSE: string;
  parentId: number | null;
  organizationId: number;
  companyTypeLookupId?: number | null;
}

export interface EditCompany {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  parentId: number | null;
  organizationId: number;
  companyTypeLookupId?: number | null;
}
