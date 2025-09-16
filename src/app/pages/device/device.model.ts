export interface Device {
  id: number;
  code: string;
  name: string;
  ipAddress: string;
  disabled: boolean;
  download: boolean;
  locationId: number;
  organizationId?: number;
  locationName?: string; 
}

export interface DeviceCreate {
  code: string;
  name: string;
  ipAddress: string;
  disabled: boolean;
  download: boolean;
  locationId: number;
  organizationId?: number; 
}

export interface DeviceUpdate extends DeviceCreate {
  id: number;
}
