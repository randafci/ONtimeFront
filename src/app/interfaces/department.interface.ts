export interface Department {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  index: number;
  parentId: number | null;
  departmentType: number | null;
  fromIntegration: boolean;
  organizationId: number;
  companyId: number | null;
  isDeleted: boolean;
  creationDate: string;
  modificationDate: string | null;
  modifiedBy: string;
  createdBy: string;
  parentName?: string;
  companyName?: string;
  organizationName?: string;
}

export interface CreateDepartment {
  code: string;
  name: string;
  nameSE: string;
  index: number;
  parentId: number | null;
  departmentType: number | null;
  fromIntegration: boolean;
  organizationId: number;
  companyId: number | null;
}

export interface EditDepartment {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  index: number;
  parentId: number | null;
  departmentType: number | null;
  fromIntegration: boolean;
  organizationId: number;
  companyId: number | null;
}
