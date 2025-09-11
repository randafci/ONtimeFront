export interface Events {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  organizationId: number;
  start: string | null;
  end: string | null;
  locationId: number | null;
  isDeleted: boolean;
  creationDate: string;
  modificationDate: string | null;
  modifiedBy: string;
  createdBy: string;
  organizationName?: string;
  locationName?: string;
}

export interface CreateEvents {
  code: string;
  name: string;
  nameSE: string;
  organizationId: number;
  start: string | null;
  end: string | null;
  locationId: number | null;
}

export interface EditEvents {
  id: number;
  code: string;
  name: string;
  nameSE: string;
  organizationId: number;
  start: string | null;
  end: string | null;
  locationId: number | null;
}
