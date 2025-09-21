export interface Family {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  organizationId: number;
  isDeleted: boolean;
  creationDate: Date;
}

export interface CreateFamily {
  code: string;
  name: string;
  nameSE: string;
  organizationId: number;
}

export interface EditFamily extends CreateFamily {
  id: number;
}