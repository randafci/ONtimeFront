
export interface ShiftType {
  id: number;
  name: string;
  nameSE: string;
  priority: number;
  organizationId: number;
  isDeleted: boolean;
  creationDate: Date;
}


export interface CreateShiftType {
  name: string;
  nameSE: string;
  priority: number;
  organizationId: number;
}


export interface EditShiftType extends CreateShiftType {
  id: number;
}