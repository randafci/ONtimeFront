// employee.interface.ts

export interface Employee {
  id: number;
  employeeCode: string;
  firstName?: string;
  lastName?: string;
  fullName?: string; // optional by default, but see EmployeeWithFullName
  gender?: string; // "M" or "F"
  nationality?: string;
  religionType?: string;
  isSpecialNeeds: boolean;
  imageUrl?: string | null;
  employeeType?: string;
  employeeStatus?: string;

  contact?: EmployeeContact;
  document?: EmployeeDocument;

  creationDate?: string;
  modificationDate?: string;
  createdBy?: string;
  modifiedBy?: string;
  isDeleted?: boolean;
  departmentName?: string;
}

export interface EmployeeContact {
  id: number;
  personalEmail?: string;
  officialEmail?: string;
  personalPhone?: string;
  personalMobile?: string;
  officialPhone?: string;
  officialMobile?: string;
  address?: string;
  city?: string;
  state?: string;
  employeeId: number;
}

export interface EmployeeDocument {
  id: number;
  passportNumber?: string;
  passportExpirationDate?: Date | null;
  visaNumber?: string;
  visaExpirationDate?: Date | null;
  employeeId: number;
}

// Extra DTOs
export interface CreateEmployee {
  employeeCode: string;
  firstName?: string;
  lastName?: string;
  gender?: string | null;
  nationality?: string;
  religionType?: string;
  isSpecialNeeds: boolean;
  imageUrl?: string;
  employeeType?: string;
  employeeStatus?: string;

  contact?: Partial<EmployeeContact>;
  document?: Partial<EmployeeDocument>;
}

export interface EditEmployee extends CreateEmployee {
  id: number;
}

export interface UpdateEmployee {
  id: number;
  employeeCode: string;
  firstName?: string;
  lastName?: string;
  gender?: string | null;
  nationality?: string;
  religionType?: string;
  isSpecialNeeds: boolean;
  imageUrl?: string;
  employeeType?: string;
  employeeStatus?: string;

  contact?: Partial<EmployeeContact>;
  document?: Partial<EmployeeDocument>;
}

// ✅ Derived interface with required fullName
export interface EmployeeWithFullName extends Employee {
  fullName: string;
}
