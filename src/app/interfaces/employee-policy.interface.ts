export interface EmployeePolicy {
    id: number;
    employeeEmploymentId: number;
    employeeId: number;
    policyId: number;
    startDateTime: Date | string;
    endDateTime?: Date | string | null;
    created?: Date | string;
    createdBy?: string;
    lastModified?: Date | string;
    lastModifiedBy?: string;
    policyType: PolicyType;
    attachmentURL?: string;
    isPermanentPolicy: boolean;
    
    policyName?: string;
    employeeName?: string;
    generalPolicy?: GeneralPolicy;
}

export interface CreateEmployeePolicy {
    employeeEmploymentId: number;
    employeeId: number;
    policyId: number;
    startDateTime: Date | string;
    endDateTime?: Date | string | null;
    policyType: PolicyType;
    attachmentURL?: string;
    isPermanentPolicy: boolean;
}

export interface EditEmployeePolicy {
    id: number;
    employeeEmploymentId: number;
    employeeId: number;
    policyId: number;
    startDateTime: Date | string;
    endDateTime?: Date | string | null;
    policyType: PolicyType;
    attachmentURL?: string;
    isPermanentPolicy: boolean;
}

export enum PolicyType {
    General = 1
}

export enum PunchRequirementMode {
    None = 0,
    CheckInOnly = 1,
    CheckOutOnly = 2,
    Both = 3
}

export enum EarlyLeavingCalc {
    None = 0,
    FromShiftEnd = 1,
    FromActualEnd = 2
}

export enum AllocatedWorkHoursType {
    None = 0,
    Fixed = 1,
    FromTemplate = 2
}

export enum ShiftOption {
    None = 0,
    Single = 1,
    Double = 2,
    Flexible = 3
}

export enum GracePeriodType {
    None = 0,
    Minutes = 1,
    FirstShift = 2,
    SecondShift = 3
}

export interface GeneralPolicy {
    id: number;
    organizationId: number;
    isActive: boolean;
    nameAr: string;
    nameEn: string;
    isDefault: boolean;
    firstInLastOut: boolean;
    validateCheckIn: boolean;
    validateCheckOut: boolean;
    punchRequirementMode: PunchRequirementMode;
    earlyLeavingCalc: EarlyLeavingCalc;
    allocatedWorkHoursType: AllocatedWorkHoursType;
    shiftOption: ShiftOption;
    lateGracePeriodForDoubleShiftType: GracePeriodType;
    earlyGracePeriodForDoubleShiftType: GracePeriodType;
    workHoursCalcOnlyForCheckInOut: boolean;
    isWebPunchEnabled: boolean;
    isMobilePunchEnabled: boolean;
    lateGracePeriod: number;
    earlyGracePeriod: number;
    calcLateAfterGracePeriod: boolean;
    calcEarlyAfterGracePeriod: boolean;
    lateMaxToMarkAsAbsent: number;
    earlyMaxToMarkAsAbsent: number;
    breakMinutesToDeduct: number;
    monthlyLateGrace: number;
    calcActualWorkHours: boolean;
    reduceMidLateFromRegularHours: boolean;
    workHoursFromShiftStartTime: boolean;
    isAbsentDueToFirstPunchInAfterShift: boolean;
    isAbsentDueToLastPunchOutBeforeShift: boolean;
    whContinuousAbsenceCalc: boolean;
    intervalBetweenPunches: number;
    allocatedWorkHoursValue: number;
    roundOffValue: number;
    allocatedWorkHoursTemplateId: string;
    excludeLateGracePeriodShiftIds?: string;
    excludeLateGracePeriodShiftTypes?: string;
    excludeEarlyGracePeriodShiftIds?: string;
    excludeEarlyGracePeriodShiftTypes?: string;
    excludeLateCalcPeriodShiftIds?: string;
    excludeLateCalcPeriodShiftTypes?: string;
    excludeEarlyCalcPeriodShiftIds?: string;
    excludeEarlyCalcPeriodShiftTypes?: string;
}
