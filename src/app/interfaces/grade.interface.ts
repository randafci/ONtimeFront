export interface Grade {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  isDeleted: boolean;
  creationDate: Date;
}

export interface CreateGrade {
  code: string;
  name: string;
  nameSE: string;
}

export interface EditGrade extends CreateGrade {
  id: number;
}