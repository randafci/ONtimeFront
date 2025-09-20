
export interface EmployeeDeviceAssignmentEditDto {
  // Define properties based on your C# DTO
  id?: number;
  employeeId: number;
  deviceId: number;
  assignedDate?: Date;
  // Add other properties as needed
}

export interface EmployeeDeviceAssignment {
  id: number;
  employeeId: number;
  deviceId: number;
  assignedDate: Date;
  deviceName?: string;
  deviceSerialNumber?: string;
  employeeName?: string;
  // Add other properties as needed
}

// Matches C# DeviceCommonDto
export interface DeviceCommonDto {
  id?: number;          
  name: string;
  code: string;
  location: string;     
  locationId: number;
  disabled: boolean;
  download: boolean;
  ipAddress: string;
}



export interface EmployeeDeviceAssignmentCommonDto {
  employeeId: number;
  devices: DeviceCommonDto[];
}

export interface EmployeeDeviceAssignmentCreateDto
  extends EmployeeDeviceAssignmentCommonDto {}
