export interface Department {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  parentId: number | null;
  organizationId: number;
  companyId: number | null;
  isDeleted: boolean;
  creationDate: string;
  modificationDate: string | null;
  modifiedBy: string;
  createdBy: string;
  departmentTypeLookupId?: number | null;
  parentName?: string;
  companyName?: string;
  organizationName?: string;
  departmentTypeName?: string;
}

export interface CreateDepartment {
  code: string;
  name: string;
  nameSE: string;
  parentId: number | null;
  organizationId: number;
  companyId: number | null;
  departmentTypeLookupId?: number | null;
}

export interface EditDepartment {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  parentId: number | null;
  organizationId: number;
  companyId: number | null;
  departmentTypeLookupId?: number | null;
}
