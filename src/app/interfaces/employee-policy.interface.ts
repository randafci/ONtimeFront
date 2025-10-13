export interface EmployeePolicy {
    id: number;
    employeeEmploymentId: number;
    policyId: string;
    startDateTime: Date | string;
    endDateTime: Date | string;
    created?: Date | string;
    createdBy?: string;
    lastModified?: Date | string;
    lastModifiedBy?: string;
    policyType: PolicyType;
    attachmentURL?: string;
    
    policyName?: string;
    employeeName?: string;
    generalPolicy?: GeneralPolicy;
}

export interface CreateEmployeePolicy {
    employeeEmploymentId: number;
    policyId: string;
    startDateTime: Date | string;
    endDateTime: Date | string;
    policyType: PolicyType;
    attachmentURL?: string;
}

export interface EditEmployeePolicy {
    id: number;
    employeeEmploymentId: number;
    policyId: string;
    startDateTime: Date | string;
    endDateTime: Date | string;
    policyType: PolicyType;
    attachmentURL?: string;
}

export enum PolicyType {
    General = 1
}

export interface GeneralPolicy {
    id: string;
    organizationId?: number;
    isActive?: boolean;
    nameAr?: string;
    nameEn?: string;
    isDefault?: boolean;
    firstInLastOut?: boolean;
    validateCheckIn?: boolean;
    validateCheckOut?: boolean;
    punchRequirementModeId?: number;
    workHoursCalcOnlyForCheckInOut?: boolean;
    isWebPunchEnabled?: boolean;
    isMobilePunchEnabled?: boolean;
    lateGracePeriod?: number;
    earlyGracePeriod?: number;
    calcLateAfterGracePeriod?: boolean;
    calcEarlyAfterGracePeriod?: boolean;
    lateMaxToMarkAsAbsent?: number;
    earlyMaxToMarkAsAbsent?: number;
    breakMinutesToDeduct?: number;
    monthlyLateGrace?: number;
    calcActualWorkHours?: boolean;
    reduceMidLateFromRegularHours?: boolean;
    workHoursFromShiftStartTime?: boolean;
    earlyLeavingCalcId?: number;
    isAbsentDueToFirstPunchInAfterShift?: boolean;
    isAbsentDueToLastPunchOutBeforeShift?: boolean;
    whContinuousAbsenceCalc?: boolean;
    intervalBetweenPunches?: number;
    allocatedWorkHoursTypeId?: number;
    allocatedWorkHoursValue?: number;
    shiftOptionId?: number;
    roundOffValue?: number;
    lateGracePeriodForDoubleShiftTypeId?: number;
    earlyGracePeriodForDoubleShiftTypeId?: number;
    allocatedWorkHoursTemplateId?: string;
    excludeLateGracePeriodShiftIds?: string;
    excludeLateGracePeriodShiftTypes?: string;
    excludeEarlyGracePeriodShiftIds?: string;
    excludeEarlyGracePeriodShiftTypes?: string;
    excludeLateCalcPeriodShiftIds?: string;
    excludeLateCalcPeriodShiftTypes?: string;
    excludeEarlyCalcPeriodShiftIds?: string;
    excludeEarlyCalcPeriodShiftTypes?: string;
}

