import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { TimeTable, CreateTimeTable, EditTimeTable, OrganizationOption } from '../../../interfaces/timetable.interface';
import { TimeTableService } from '../TimeTableService';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { LookupService } from '../../organization/OrganizationService';
import { Organization } from '../../../interfaces/organization.interface';
import { Toast } from "primeng/toast";

@Component({
  selector: 'app-timetable-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    CheckboxModule,
    InputNumberModule,
    Toast
  ],
  providers: [MessageService],
  templateUrl: './timetable-modal.component.html',
})
export class TimeTableModalComponent implements  OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() timeTable: TimeTable | null = null;
  @Input() organizationOptions: OrganizationOption[] = [];
  @Input() isSuperAdmin: boolean = false;
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<TimeTable>();
  @Output() onCancelEvent = new EventEmitter<void>();

  timeTableForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private timeTableService: TimeTableService,
    private messageService: MessageService,
    private authService: AuthService,
    private organizationService: LookupService
  ) {
    this.timeTableForm = this.createForm();
  }

 

  ngOnChanges() {
    if (this.dialogVisible && this.timeTable) {
      this.loadTimeTableData();
    } else if (this.dialogVisible && !this.isEditMode) {
      this.resetForm();
    }
    
    // Load organizations if they're not provided and dialog is opened
    if (this.dialogVisible && this.organizationOptions.length === 0) {
      this.loadOrganizations();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: [''],
      organizationId: [null, Validators.required],
      
      // Time settings
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      
      // Flexible range settings
      isCheckInOutRangeEnabled: [false],
      beginIn: [''],
      beginOut: [''],
      endIn: [''],
      endOut: [''],
      
      // Shift configuration
      isActive: [true],
      isWeekend: [false],
      isNightShift: [false],
      isPreNightShift: [false],
      isOpenShift: [false],
      isTrainingCourse: [false],
      trainingCourseExtraWorkHours: [null],
      isFromIntegration: [false]
    }, { validators: this.timeValidation.bind(this) });
  }

  loadTimeTableData(): void {
    if (this.timeTable) {
      // Convert time strings to HH:MM format for time inputs
      const convertTimeToTimeInput = (timeString?: string): string => {
        if (!timeString) return '';
        return timeString.substring(0, 5); // Convert "HH:MM:SS" to "HH:MM"
      };

      this.timeTableForm.patchValue({
        nameEn: this.timeTable.nameEn,
        nameAr: this.timeTable.nameAr,
        organizationId: this.timeTable.organizationId,
        
        startTime: convertTimeToTimeInput(this.timeTable.startTime),
        endTime: convertTimeToTimeInput(this.timeTable.endTime),
        
        isCheckInOutRangeEnabled: this.timeTable.isCheckInOutRangeEnabled,
        beginIn: convertTimeToTimeInput(this.timeTable.beginIn),
        beginOut: convertTimeToTimeInput(this.timeTable.beginOut),
        endIn: convertTimeToTimeInput(this.timeTable.endIn),
        endOut: convertTimeToTimeInput(this.timeTable.endOut),
        
        isActive: this.timeTable.isActive,
        isWeekend: this.timeTable.isWeekend,
        isNightShift: this.timeTable.isNightShift,
        isPreNightShift: this.timeTable.isPreNightShift,
        isOpenShift: this.timeTable.isOpenShift,
        isTrainingCourse: this.timeTable.isTrainingCourse,
        trainingCourseExtraWorkHours: this.timeTable.trainingCourseExtraWorkHours,
        isFromIntegration: this.timeTable.isFromIntegration
      });
    }
  }

  resetForm(): void {
    this.timeTableForm.reset();
    // Set default values
    this.timeTableForm.patchValue({
      isActive: true,
      isWeekend: false,
      isNightShift: false,
      isPreNightShift: false,
      isOpenShift: false,
      isTrainingCourse: false,
      isCheckInOutRangeEnabled: false,
      isFromIntegration: false
    });

    // Set organization for non-super admin users
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.timeTableForm.patchValue({ organizationId: +orgId });
      }
    }
  }

  loadOrganizations(): void {
    this.organizationService.getAllOrganizations().subscribe({
      next: (response: ApiResponse<Organization[]>) => {
        if (response.succeeded) {
          this.organizationOptions = response.data.map(org => ({
            label: org.name,
            value: org.id
          }));
          
          // Set organization for non-super admin users after loading
          if (!this.isSuperAdmin) {
            const orgId = this.authService.getOrgId();
            if (orgId) {
              this.timeTableForm.patchValue({ organizationId: +orgId });
            }
          }
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load organizations'
          });
        }
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load organizations'
        });
      }
    });
  }

  onShiftTypeChange() {
    const isNightShift = this.timeTableForm.get('isNightShift')?.value;
    const isPreNightShift = this.timeTableForm.get('isPreNightShift')?.value;
    
    // Pre-night shift can only be enabled for night shifts
    if (!isNightShift && isPreNightShift) {
      this.timeTableForm.patchValue({ isPreNightShift: false });
    }

    // Revalidate the form when shift type changes
    this.timeTableForm.updateValueAndValidity();
  }

  timeValidation(formGroup: FormGroup): { [key: string]: any } | null {
    const startTime = formGroup.get('startTime')?.value;
    const endTime = formGroup.get('endTime')?.value;
    const isNightShift = formGroup.get('isNightShift')?.value;

    if (!startTime || !endTime) {
      return null; // Let required validators handle empty values
    }

    const startTimeMinutes = this.timeToMinutes(startTime);
    const endTimeMinutes = this.timeToMinutes(endTime);

    if (isNightShift) {
      // Night shift: end time must be earlier than start time (spans midnight)
      if (endTimeMinutes >= startTimeMinutes) {
        return { 
          nightShiftTimeError: {
            message: 'Night shift end time must be earlier than start time (shift spans midnight).'
          }
        };
      }
    } else {
      // Regular shift: end time must be later than start time
      if (endTimeMinutes <= startTimeMinutes) {
        return { 
          regularShiftTimeError: {
            message: 'Regular shift end time must be later than start time.'
          }
        };
      }
    }

    return null;
  }

  private timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  getTimeValidationError(): string | null {
    const errors = this.timeTableForm.errors;
    if (errors?.['nightShiftTimeError']) {
      return errors['nightShiftTimeError'].message;
    }
    if (errors?.['regularShiftTimeError']) {
      return errors['regularShiftTimeError'].message;
    }
    return null;
  }

  getWorkingHours(): string | null {
    const startTime = this.timeTableForm.get('startTime')?.value;
    const endTime = this.timeTableForm.get('endTime')?.value;
    const isNightShift = this.timeTableForm.get('isNightShift')?.value;

    if (!startTime || !endTime || this.getTimeValidationError()) {
      return null;
    }

    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    let totalMinutes: number;

    if (isNightShift) {
      // Night shift spans midnight: (24:00 - start) + end
      totalMinutes = (24 * 60 - startMinutes) + endMinutes;
    } else {
      // Regular shift: end - start
      totalMinutes = endMinutes - startMinutes;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes > 0 ? minutes + 'm' : ''}`.trim();
  }

  onFlexibleRangeChange() {
    const isEnabled = this.timeTableForm.get('isCheckInOutRangeEnabled')?.value;
    
    if (!isEnabled) {
      // Clear flexible range times when disabled
      this.timeTableForm.patchValue({
        beginIn: '',
        beginOut: '',
        endIn: '',
        endOut: ''
      });
    }
  }

  onSubmit(): void {
    if (this.timeTableForm.invalid) {
      this.markFormGroupTouched(this.timeTableForm);
      
      const timeError = this.getTimeValidationError();
      if (timeError) {
        this.messageService.add({
          severity: 'error',
          summary: 'Time Validation Error',
          detail: timeError
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please fill in all required fields and fix any validation errors'
        });
      }
      return;
    }

    const formData = this.prepareFormData();

    if (this.isEditMode && this.timeTable) {
      const editData: EditTimeTable = { ...formData, id: this.timeTable.id } as EditTimeTable;
      this.updateTimeTable(editData);
    } else {
      this.createTimeTable(formData as CreateTimeTable);
    }
  }

  // Add this method to handle API validation errors
  private handleApiValidationErrors(error: any): void {
    console.log('API Validation Error:', error);
    
    if (error.status === 400 && error.error?.errors) {
      const validationErrors = error.error.errors;
      
      // Handle specific field errors
      Object.keys(validationErrors).forEach(fieldName => {
        const fieldErrors = validationErrors[fieldName];
        
        if (fieldErrors && fieldErrors.length > 0) {
          // Get the form control
          const formControl = this.timeTableForm.get(this.mapFieldNameToFormControl(fieldName));
          
          if (formControl) {
            // Set the error on the form control
            formControl.setErrors({ 
              apiValidation: fieldErrors[0] 
            });
            formControl.markAsTouched();
          }
          
          // Show user-friendly message
          const fieldDisplayName = this.getFieldDisplayName(fieldName);
          this.messageService.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: `${fieldDisplayName}: ${fieldErrors[0]}`
          });
        }
      });
      
      // Mark the form as touched to show validation styles
      this.markFormGroupTouched(this.timeTableForm);
    } else {
      // Generic error handling
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.error?.title || 'An unexpected error occurred'
      });
    }
  }

  // Map API field names to form control names
  private mapFieldNameToFormControl(apiFieldName: string): string {
    const fieldMap: { [key: string]: string } = {
      'NameAr': 'nameAr',
      'NameEn': 'nameEn',
      'OrganizationId': 'organizationId',
      'StartTime': 'startTime',
      'EndTime': 'endTime',
      // Add more mappings as needed
    };
    
    return fieldMap[apiFieldName] || apiFieldName;
  }

  // Get user-friendly field names
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'NameAr': 'Arabic Name',
      'NameEn': 'English Name',
      'OrganizationId': 'Organization',
      'StartTime': 'Start Time',
      'EndTime': 'End Time',
      // Add more display names as needed
    };
    
    return displayNames[fieldName] || fieldName;
  }

  createTimeTable(data: CreateTimeTable): void {
    this.timeTableService.createTimeTable(data).subscribe({
      next: (response: ApiResponse<TimeTable>) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'TimeTable created successfully'
          });
          this.onSave.emit(response.data);
          this.closeDialog();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to create timetable'
          });
        }
      },
      error: (error) => {
        console.error('Error creating timetable:', error);
        
        // ✅ FIX: Call handleApiValidationErrors here for API errors
        if (error.status === 400 && error.error?.errors) {
          this.handleApiValidationErrors(error);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create timetable'
          });
        }
      }
    });
  }

  updateTimeTable(data: EditTimeTable): void {
    this.timeTableService.updateTimeTable(data.id, data).subscribe({
      next: (response: ApiResponse<TimeTable>) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'TimeTable updated successfully'
          });
          this.onSave.emit(response.data);
          this.closeDialog();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to update timetable'
          });
        }
      },
      error: (error) => {
        console.error('Error updating timetable:', error);
        
        // ✅ FIX: Call handleApiValidationErrors here for API errors
        if (error.status === 400 && error.error?.errors) {
          this.handleApiValidationErrors(error);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update timetable'
          });
        }
      }
    });
  }

  prepareFormData(): CreateTimeTable | EditTimeTable {
    const formValue = this.timeTableForm.value;
    
    // Convert time input values to time strings that match backend TimeSpan format
    const convertTimeToTimeString = (timeInput: string): string | undefined => {
      if (!timeInput || timeInput.trim() === '') return undefined;
      
      // Ensure we have HH:MM:SS format for backend TimeSpan
      const timeParts = timeInput.split(':');
      if (timeParts.length === 2) {
        return `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}:00`;
      } else if (timeParts.length === 3) {
        return `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}:${timeParts[2].padStart(2, '0')}`;
      }
      
      return timeInput;
    };

    const data: CreateTimeTable = {
      nameAr: formValue.nameAr?.trim() || undefined,
      nameEn: formValue.nameEn?.trim(),
      organizationId: formValue.organizationId,
      
      startTime: convertTimeToTimeString(formValue.startTime),
      endTime: convertTimeToTimeString(formValue.endTime),
      
      beginIn: formValue.isCheckInOutRangeEnabled ? convertTimeToTimeString(formValue.beginIn) : undefined,
      beginOut: formValue.isCheckInOutRangeEnabled ? convertTimeToTimeString(formValue.beginOut) : undefined,
      endIn: formValue.isCheckInOutRangeEnabled ? convertTimeToTimeString(formValue.endIn) : undefined,
      endOut: formValue.isCheckInOutRangeEnabled ? convertTimeToTimeString(formValue.endOut) : undefined,
      
      isActive: Boolean(formValue.isActive),
      isWeekend: Boolean(formValue.isWeekend),
      isNightShift: Boolean(formValue.isNightShift),
      isPreNightShift: Boolean(formValue.isPreNightShift && formValue.isNightShift),
      isOpenShift: Boolean(formValue.isOpenShift),
      isTrainingCourse: Boolean(formValue.isTrainingCourse),
      isCheckInOutRangeEnabled: Boolean(formValue.isCheckInOutRangeEnabled),
      trainingCourseExtraWorkHours: formValue.trainingCourseExtraWorkHours || undefined,
      isFromIntegration: Boolean(formValue.isFromIntegration),
      
      timeShifts: []
    };

    return data;
  }

  onDialogHide(): void {
    this.closeDialog();
  }

  closeDialog(): void {
    this.dialogVisibleChange.emit(false);
  }

  onCancel(): void {
    this.closeDialog();
    this.onCancelEvent.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}