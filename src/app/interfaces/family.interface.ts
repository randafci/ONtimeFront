export interface Family {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  isDeleted: boolean;
  creationDate: Date;
}

export interface CreateFamily {
  code: string;
  name: string;
  nameSE: string;
}

export interface EditFamily extends CreateFamily {
  id: number;
}