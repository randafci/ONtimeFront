export interface Grade {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  organizationId: number;
  isDeleted: boolean;
  creationDate: Date;
}

export interface CreateGrade {
  code: string;
  name: string;
  nameSE: string;
  organizationId: number;
}

export interface EditGrade extends CreateGrade {
  id: number;
}