export interface Location {
  id: number;
  code: string;
  name: string;
  indexValue: number;
  long?: number;
  lat?: number;
  fence?: number;
  parentId?: number;
  organizationId: number;
}

export interface CreateLocation {
  code: string;
  name: string;
  indexValue: number;
  long?: number;
  lat?: number;
  fence?: number;
  parentId?: number;
  organizationId: number;
}

export interface EditLocation {
  id: number;
  code: string;
  name: string;
  indexValue: number;
  long?: number;
  lat?: number;
  fence?: number;
  parentId?: number;
  organizationId: number;
}