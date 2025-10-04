export interface UserRole {
    roleId: string;
    roleName: string;
    isSelected: boolean;
}

export interface UpdateUserRoles {
    roleNames: string[];
}