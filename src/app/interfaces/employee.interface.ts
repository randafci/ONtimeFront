// In user.interface.ts (or create employee.interface.ts)
export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  gender: string; // "M" or "F"
  nationality: string;
  religionType: string;
  isSpecialNeeds: boolean;
  imageUrl: string | null;
  employeeType: string;
  employeeStatus: string;
  contact?: any; // Adjust based on actual structure
  document?: any; // Adjust based on actual structure
}

// Add a method to get full name
export interface EmployeeWithFullName extends Employee {
  fullName: string;
}