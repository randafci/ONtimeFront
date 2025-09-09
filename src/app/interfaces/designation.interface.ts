export interface Designation {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  organizationId: number;
  isDeleted: boolean;
  creationDate: string;
  parentId?: number;
  parentName?: string;
  designationsTypeLookupId?: number;
}

export interface CreateDesignation {
  code: string;
  name: string;
  nameSE: string;
  organizationId: number;
  parentId?: number;
  designationsTypeLookupId?: number;
}

export interface EditDesignation {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  organizationId: number;
  parentId?: number;
  designationsTypeLookupId?: number;
}
