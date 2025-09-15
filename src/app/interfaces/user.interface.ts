export interface UserDto {
  id: string;
  userName: string;
  email: string;
  isLdapUser: boolean;
  extraEmployeesView: string;
  employeeId?: number;
  organizationId?: number;
}

export interface CreateUserDto {
  password: string;
  userName: string;
  email: string;
  isLdapUser: boolean;
  extraEmployeesView: string;
  employeeId?: number;
  organizationId?: number;
}

export interface UpdateUserDto {
  id: string;
  userName: string;
  email: string;
  isLdapUser: boolean;
  extraEmployeesView: string;
  employeeId?: number;
   organizationId?: number;
}
