export interface RamadanPeriod {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  start: string;
  end: string;
  created: string;
  createdBy: string;
  lastModified?: string;
  lastModifiedBy?: string;
  isDeleted: boolean;
}

export interface CreateRamadanPeriod {
  code: string;
  name: string;
  nameSE: string;
  start: string;
  end: string;
}

export interface EditRamadanPeriod {
  code: string;
  name: string;
  nameSE: string;
  start: string;
  end: string;
}
