export interface HolidayTypeList {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  organizationId: number;
  isDeleted: boolean;
  creationDate: string;
  modificationDate: string | null;
  modifiedBy: string;
  createdBy: string;
}
