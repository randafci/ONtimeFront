export interface Organization {
  id: number;
    name: string;
    nameSE: string;
    isDeleted: boolean;
    jobs: any[];
    creationDate: string;
    modificationDate: string | null;
    modifiedBy: string;
    createdBy: string;
}
export interface CreateOrganization {
    name: string;
    nameSE: string;
    
}
export interface EditOrganization {
    id: number;
    name: string;
    nameSE: string;
    
}