import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG Module Imports
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Your Services and DTOs
import { GeneralPolicyService } from '../general-policy.service';
import { GeneralPolicyDto } from '../../../interfaces/general-policy.interface';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Shift } from '../../../interfaces/shift.interface';
import { ShiftService } from '../../shift/ShiftService';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

// --- ENUMS for type-safe, hardcoded values ---
export enum AllocatedWorkHoursType {
    Shift = 1,
    Fixed = 2
}

export enum ShiftOption {
    NoShift = 1,
    DefaultShift = 2,
    PreviousRecentShift = 3
}

export enum EarlyLeavingOption {
    ShiftEndTime = 1,
    ShiftFullDayHours = 2
}

export enum PunchRequirementMode {
    CheckInOutRequired = 1,
    CheckInOnly = 2,
}

export enum DoubleShiftType {
    TypeA = 1,
    TypeB = 2,
}

export enum ShiftTypeEnum { // Renamed to avoid conflict with 'Shift' interface
    Regular = 1,
    Night = 2,
}

interface Option {
  label: string;
  value: any;
}

@Component({
  selector: 'app-add-edit-general-policy',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, HttpClientModule, PanelModule, InputTextModule,
    CheckboxModule, InputNumberModule, MultiSelectModule, TooltipModule, SelectModule,
    ButtonModule, ToastModule, TranslatePipe
  ],
  providers: [GeneralPolicyService, ShiftService, MessageService],
  templateUrl: './add-edit-general-policy.component.html',
  styleUrls: ['./add-edit-general-policy.component.scss'],
})
export class AddEditGeneralPolicyComponent implements OnInit {
  policyForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  policyId: string | null = null;
  
  masterShiftsList: Shift[] = [];
  filteredShifts: Shift[] = [];

  // --- Dropdown data now uses Enums or is clearly marked as mock ---
  // allocatedWorkHoursTypeList: Option[] = [ 
  //   { label: 'Shift', value: AllocatedWorkHoursType.Shift }, 
  //   { label: 'Fixed', value: AllocatedWorkHoursType.Fixed } 
  // ];
  // shiftOptionList: Option[] = [ 
  //   { label: 'No shift', value: ShiftOption.NoShift }, 
  //   { label: 'Default Shift', value: ShiftOption.DefaultShift }, 
  //   { label: 'Previous Recent Shift', value: ShiftOption.PreviousRecentShift } 
  // ];
  // earlyLeavingOptionList: Option[] = [ 
  //   { label: 'Based on shift end time', value: EarlyLeavingOption.ShiftEndTime }, 
  //   { label: 'Based on shift full day hours', value: EarlyLeavingOption.ShiftFullDayHours } 
  // ];
  
  // // New dropdowns using enums or mock data
  // punchRequirementModes: Option[] = [ { label: 'Check In/Out Required', value: PunchRequirementMode.CheckInOutRequired }, { label: 'Check In Only', value: PunchRequirementMode.CheckInOnly } ];
  // doubleShiftTypes: Option[] = [ { label: 'Type A', value: DoubleShiftType.TypeA }, { label: 'Type B', value: DoubleShiftType.TypeB } ];
  // shiftTypes: Option[] = [ { label: 'Regular', value: ShiftTypeEnum.Regular }, { label: 'Night', value: ShiftTypeEnum.Night } ];
  // // workHourTemplates: Option[] = [ { label: 'Template 1', value: 'guid1' }, { label: 'Template 2', value: 'guid2' } ]; // This would likely become dynamic
  // workHourTemplates: Option[] = [ 
  //   { label: 'Template 1', value: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d' }, 
  //   { label: 'Template 2', value: '9z8y7x6w-5v4u-3t2s-1r0q-9p8o7n6m5l4k' } // Note: GUIDs are hex, so this 2nd one is technically invalid but visually correct. Use real ones.
  // ];

  // Dropdown data properties
  allocatedWorkHoursTypeList: Option[] = [];
  shiftOptionList: Option[] = [];
  earlyLeavingOptionList: Option[] = [];
  punchRequirementModes: Option[] = [];
  doubleShiftTypes: Option[] = [];
  shiftTypes: Option[] = [];
  workHourTemplates: Option[] = []; 

  constructor(
    private generalPolicyService: GeneralPolicyService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private shiftService: ShiftService,
    private router: Router,
    private translationService: TranslationService
  ) {
    // Populate dropdown options using translations
    this.translationService.translations$.subscribe(translations => {
        const trans = translations.policies?.form?.options || {};
        
        this.allocatedWorkHoursTypeList = [ 
            { label: trans.shift || 'Shift', value: AllocatedWorkHoursType.Shift }, 
            { label: trans.fixed || 'Fixed', value: AllocatedWorkHoursType.Fixed } 
        ];
        this.shiftOptionList = [ 
            { label: trans.noShift || 'No shift', value: ShiftOption.NoShift }, 
            { label: trans.defaultShift || 'Default Shift', value: ShiftOption.DefaultShift }, 
            { label: trans.previousRecentShift || 'Previous Recent Shift', value: ShiftOption.PreviousRecentShift } 
        ];
        this.earlyLeavingOptionList = [ 
            { label: trans.basedOnShiftEndTime || 'Based on shift end time', value: EarlyLeavingOption.ShiftEndTime }, 
            { label: trans.basedOnShiftFullDayHours || 'Based on shift full day hours', value: EarlyLeavingOption.ShiftFullDayHours } 
        ];
        this.punchRequirementModes = [ 
            { label: trans.checkInOutRequired || 'Check In/Out Required', value: PunchRequirementMode.CheckInOutRequired }, 
            { label: trans.checkInOnly || 'Check In Only', value: PunchRequirementMode.CheckInOnly } 
        ];
        this.doubleShiftTypes = [ 
            { label: trans.typeA || 'Type A', value: DoubleShiftType.TypeA }, 
            { label: trans.typeB || 'Type B', value: DoubleShiftType.TypeB } 
        ];
        this.shiftTypes = [ 
            { label: trans.regular || 'Regular', value: ShiftTypeEnum.Regular }, 
            { label: trans.night || 'Night', value: ShiftTypeEnum.Night } 
        ];
        // This would likely become dynamic from an API in a real scenario
        this.workHourTemplates = [ 
          { label: 'Template 1', value: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d' }, 
          { label: 'Template 2', value: '9z8y7x6w-5v4u-3t2s-1r0q-9p8o7n6m5l4k' }
        ];
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadAllShifts(); 
    
    this.route.paramMap.subscribe(params => {
      this.policyId = params.get('id');
      if (this.policyId) {
        this.isEditMode = true;
        this.loadPolicyData(this.policyId);
      } else {
        this.isEditMode = false;
        this.toggleAllocatedWorkHours();
      }
    });

    this.policyForm.get('allocatedWorkHoursTypeId')?.valueChanges.subscribe(() => {
        this.toggleAllocatedWorkHours();
    });
  }
  
  loadAllShifts(): void {
    this.shiftService.getAllShifts().subscribe((res: ApiResponse<Shift[]>) => {
      if (res.succeeded && res.data) {
        this.masterShiftsList = res.data;
        this.filteredShifts = [...this.masterShiftsList];
      }
    });
  }

  initializeForm(): void {
    this.policyForm = new FormGroup({
      nameEn: new FormControl('', [Validators.required]),
      nameAr: new FormControl('', [Validators.required]),
      isMobilePunchEnabled: new FormControl(false),
      isWebPunchEnabled: new FormControl(false),
      isAbsentDueToFirstPunchInAfterShift: new FormControl(true),
      lateGracePeriod: new FormControl(0, [Validators.required, Validators.min(0)]),
      earlyGracePeriod: new FormControl(0, [Validators.required, Validators.min(0)]),
      lateMaxToMarkAsAbsent: new FormControl(0, [Validators.required, Validators.min(0)]),
      earlyMaxToMarkAsAbsent: new FormControl(0, [Validators.required, Validators.min(0)]),
      excludeLateGracePeriodShiftIds: new FormControl([]),
      excludeEarlyGracePeriodShiftIds: new FormControl([]),
      monthlyLateGrace: new FormControl(0, [Validators.required, Validators.min(0)]),
      validateCheckIn: new FormControl(false),
      validateCheckOut: new FormControl(false),
      calcLateAfterGracePeriod: new FormControl(false),
      calcEarlyAfterGracePeriod: new FormControl(false),
      allocatedWorkHoursTypeId: new FormControl(AllocatedWorkHoursType.Shift),
      allocatedWorkHoursValue: new FormControl({ value: 0, disabled: true }, [Validators.required, Validators.min(0)]),
      breakMinutesToDeduct: new FormControl(0, [Validators.required, Validators.min(0)]),
      firstInLastOut: new FormControl(false),
      workHoursFromShiftStartTime: new FormControl(false),
      whContinuousAbsenceCalc: new FormControl(false),
      shiftOptionId: new FormControl(ShiftOption.NoShift),
      earlyLeavingCalcId: new FormControl(EarlyLeavingOption.ShiftEndTime),
      intervalBetweenPunches: new FormControl(1, [Validators.required, Validators.min(0)]),
      isActive: new FormControl(true),
      isDefault: new FormControl(false),
      punchRequirementModeId: new FormControl(PunchRequirementMode.CheckInOutRequired),
      workHoursCalcOnlyForCheckInOut: new FormControl(false),
      reduceMidLateFromRegularHours: new FormControl(false),
      isAbsentDueToLastPunchOutBeforeShift: new FormControl(false),
      roundOffValue: new FormControl(0),
      lateGracePeriodForDoubleShiftTypeId: new FormControl(null),
      earlyGracePeriodForDoubleShiftTypeId: new FormControl(null),
      allocatedWorkHoursTemplateId: new FormControl(null),
      excludeLateGracePeriodShiftTypes: new FormControl([]),
      excludeEarlyGracePeriodShiftTypes: new FormControl([]),
      excludeLateCalcPeriodShiftIds: new FormControl([]),
      excludeLateCalcPeriodShiftTypes: new FormControl([]),
      excludeEarlyCalcPeriodShiftIds: new FormControl([]),
      excludeEarlyCalcPeriodShiftTypes: new FormControl([]),
      calcActualWorkHours: new FormControl(false),
    });
  }

  private toggleAllocatedWorkHours(): void {
    const typeControl = this.policyForm.get('allocatedWorkHoursTypeId');
    const valueControl = this.policyForm.get('allocatedWorkHoursValue');
    if (!typeControl || !valueControl) return;

    if (typeControl.value === AllocatedWorkHoursType.Fixed) {
        valueControl.enable();
    } else {
        valueControl.disable();
        valueControl.setValue(0);
    }
  }

  loadPolicyData(id: string): void {
    this.generalPolicyService.getGeneralPolicyById(id).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          const policy = response.data;
          const formValues: any = { ...policy };
          const keysToTransform: (keyof GeneralPolicyDto)[] = [
            'excludeLateGracePeriodShiftIds', 'excludeEarlyGracePeriodShiftIds',
            'excludeLateCalcPeriodShiftIds', 'excludeEarlyCalcPeriodShiftIds',
            'excludeLateGracePeriodShiftTypes', 'excludeEarlyGracePeriodShiftTypes',
            'excludeLateCalcPeriodShiftTypes', 'excludeEarlyCalcPeriodShiftTypes',
          ];
  
          keysToTransform.forEach(key => {
            if (typeof policy[key] === 'string' && (policy[key] as string).length > 0) {
              formValues[key] = (policy[key] as string).split(',').map(Number);
            } else {
              formValues[key] = [];
            }
          });
          
          this.policyForm.patchValue(formValues);
          this.toggleAllocatedWorkHours();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message || 'Could not load policy data.' });
        }
      },
      error: (err) => {
        console.error("Failed to load policy data:", err);
        this.messageService.add({ severity: 'error', summary: 'API Error', detail: 'Failed to fetch policy details.' });
      }
    });
  }

  onFilterShifts(event: { originalEvent: Event, filter: string }): void {
    const filterValue = (event.filter || '').toLowerCase();
    
    if (!filterValue) {
        this.filteredShifts = [...this.masterShiftsList];
    } else {
        this.filteredShifts = this.masterShiftsList.filter(shift => 
            shift.shiftTypeName?.toLowerCase().includes(filterValue)
        );
    }
  }

  onSubmit(): void {
    if (this.policyForm.invalid) {
      this.policyForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill all required fields.' });
      return;
    }

    this.isSubmitting = true;
    const formValue = this.policyForm.getRawValue();
    const payload: Partial<GeneralPolicyDto> = { ...formValue };

    const arrayToStringKeys: (keyof GeneralPolicyDto)[] = [
      'excludeLateGracePeriodShiftIds', 'excludeEarlyGracePeriodShiftIds',
      'excludeLateGracePeriodShiftTypes', 'excludeEarlyGracePeriodShiftTypes',
      'excludeLateCalcPeriodShiftIds', 'excludeLateCalcPeriodShiftTypes',
      'excludeEarlyCalcPeriodShiftIds', 'excludeEarlyCalcPeriodShiftTypes'
    ];

    for (const key of arrayToStringKeys) {
      if (Array.isArray(payload[key])) {
        (payload[key] as any) = (payload[key] as any[]).join(',');
      }
    }
    
    const apiCall = this.isEditMode && this.policyId
      ? this.generalPolicyService.updateGeneralPolicy(this.policyId, payload as GeneralPolicyDto)
      : this.generalPolicyService.createGeneralPolicy(payload as GeneralPolicyDto);

    apiCall.subscribe({
      next: (response: ApiResponse<GeneralPolicyDto>) => {
        this.isSubmitting = false;
        if (response.succeeded) {
          const successMsg = this.isEditMode ? 'Policy updated successfully!' : 'Policy created successfully!';
          this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message || successMsg });
          setTimeout(() => {
            this.router.navigate(['/general-policy/list']);
          }, 1500); // Wait 1.5 seconds for user to see the success message
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message || 'An error occurred.' });
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.messageService.add({ severity: 'error', summary: 'API Error', detail: 'An unexpected error occurred. Please try again.' });
        console.error('API Error:', err);
      }
    });
  }
  onCancel(): void {
    this.router.navigate(['/general-policy/list']);
  }
}