import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { Attendance, CreateAttendance, EditAttendance } from '../../../interfaces/attendance.interface';
import { Employee } from '../../../interfaces/employee.interface';
import { AttendanceService } from '../AttendanceService';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { Toast } from "primeng/toast";

@Component({
  selector: 'app-attendance-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    DatePickerModule,
    Toast,
    TranslatePipe
],
  providers: [MessageService],
  templateUrl: './attendance-modal.component.html'
})
export class AttendanceModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() attendance: Attendance | null = null;
  @Input() employees: Employee[] = [];
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<Attendance>();
  @Output() onCancelEvent = new EventEmitter<void>();

  attendanceForm: FormGroup;
  private translations: any = {};

  // Options for dropdowns
  verifyStatusOptions = [
    { label: 'FingerPrint', value: 'FingerPrint' },
    { label: 'Card', value: 'Card' },
    { label: 'Manual', value: 'Manual' }
  ];

  punchTypeOptions = [
    { label: 'Check In', value: 'Check In' },
    { label: 'Check Out', value: 'Check Out' },
    { label: 'Break In', value: 'Break In' },
    { label: 'Break Out', value: 'Break Out' }
  ];

  constructor(
    private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private messageService: MessageService,
    private translationService: TranslationService
  ) {
    this.attendanceForm = this.createForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['employees']) {
      // Add displayName to employees for dropdown
      if (this.employees) {
        this.employees = this.employees.map(emp => ({
          ...emp,
          displayName: `${emp.firstName} ${emp.lastName} (${emp.employeeCode})`
        }));
      }
    }
    
    if (changes['dialogVisible'] && this.dialogVisible) {
      this.loading = false;
      
      if (this.isEditMode && this.attendance) {
        this.loadAttendanceData();
      } else if (!this.isEditMode) {
        this.resetForm();
      }
    }
  }

  ngOnInit() {
    this.translationService.translations$.subscribe(trans => {
      this.translations = trans;
    });
  }


  createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      employeeId: [null, Validators.required],
      punchDateTime: [null, Validators.required]
    });
  }

  loadAttendanceData(): void {
    if (this.attendance) {
      this.attendanceForm.patchValue({
        id: this.attendance.id,
        employeeId: this.attendance.employeeId,
        punchDateTime: new Date(this.attendance.punchDate + 'T' + this.attendance.punchTime)
      });
    }
  }

  resetForm(): void {
    this.attendanceForm.reset();
  }

  onSubmit(): void {
    if (this.attendanceForm.invalid) {
      this.markFormGroupTouched(this.attendanceForm);
      return;
    }

    this.loading = true;
    const formData = this.attendanceForm.value;

    // Convert to local timezone string instead of UTC
    const localDateTime = this.formatLocalDateTime(formData.punchDateTime);

    if (this.isEditMode) {
      const editData: EditAttendance = {
        id: formData.id,
        employeeId: formData.employeeId,
        punchDateTime: localDateTime
      };
      this.updateAttendance(editData);
    } else {
      const createData: CreateAttendance = {
        employeeId: formData.employeeId,
        punchDateTime: localDateTime
      };
      this.createAttendance(createData);
    }
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }

  private formatLocalDateTime(date: Date): string {
    if (!date) return '';
    
    // Format the date and time in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

 createAttendance(data: CreateAttendance): void {
  this.attendanceService.createAttendance(data).subscribe({
    next: (response: ApiResponse<Attendance>) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Attendance record created successfully'
      });
      this.loading = false;
      this.onSave.emit(response.data);
      this.closeDialog();
    },
    error: (error) => {
      const backendMessage =
        error?.error?.message ||
        error?.error?.value ||
        'Failed to create attendance record';

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: backendMessage
      });

      this.loading = false;
    }
  });
}


  updateAttendance(data: EditAttendance): void {
    this.attendanceService.updateAttendance(data).subscribe({
      next: (response: ApiResponse<Attendance>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Attendance record updated successfully'
        });
        this.loading = false;
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update attendance record'
        });
        this.loading = false;
      }
    });
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
