export interface Shift {
    id: number;
    shiftTypeId: number;
    organizationId: number;
    isDefaultShift: boolean;

    // Optional properties for displaying names in the table
    shiftTypeName?: string;
    organizationName?: string;
}

export interface CreateShiftDto {
    shiftTypeId: number;
    organizationId: number;
    isDefaultShift: boolean;
}

export interface UpdateShiftDto extends CreateShiftDto {
    id: number;
}