export interface Section {
  id: number; 
  code: string;
  name: string;
  nameSE: string;
  parentId?: number;
  organizationId: number;
  companyId?: number;
  sectionTypeLookupId: number;
  isDeleted: boolean;
  creationDate: Date;
  parent?: Section;
  organization?: any;
  company?: any;
  sectionType?: string;
}

export interface CreateSection {
  code: string;
  name: string;
  nameSE: string;
  parentId?: number;
  organizationId: number;
  companyId?: number;
  sectionTypeLookupId: number;
}

export interface EditSection {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  parentId?: number;
  organizationId: number;
  companyId?: number;
  sectionTypeLookupId: number;
}
