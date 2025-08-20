export interface CompanyType {
  id: number;
  name: string;
  nameSE: string;
  isDeleted: boolean;
  creationDate: string;
  modificationDate: string | null;
  modifiedBy: string;
  createdBy: string;
}
