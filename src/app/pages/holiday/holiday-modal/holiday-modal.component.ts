import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Holiday, CreateHoliday, EditHoliday } from '../../../interfaces/holiday.interface';
import { HolidayTypeList } from '../../../interfaces/holiday-type.interface';
import { HolidayService } from '../HolidayService';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-holiday-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    TranslatePipe
  ],
  providers: [MessageService],
  templateUrl: './holiday-modal.component.html',
})
export class HolidayModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() holiday: Holiday | null = null;
  @Input() holidayTypes: HolidayTypeList[] = [];
  @Input() isSuperAdmin: boolean = false;
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<Holiday>();
  @Output() onCancelEvent = new EventEmitter<void>();

  holidayForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private holidayService: HolidayService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.holidayForm = this.createForm();
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.dialogVisible && this.holiday) {
      this.loadHolidayData();
    } else if (this.dialogVisible && !this.isEditMode) {
      this.resetForm();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      holidayTypeId: [null, Validators.required],
      start: [null, Validators.required],
      end: [null, Validators.required],
      symbol: ['', [Validators.required, Validators.maxLength(3)]]
    });
  }

  loadHolidayData(): void {
    if (this.holiday) {
      const startDate = new Date(this.holiday.start);
      const endDate = new Date(this.holiday.end);
      
      this.holidayForm.patchValue({
        id: this.holiday.id,
        holidayTypeId: this.holiday.holidayTypeId,
        start: this.formatDateForInput(startDate),
        end: this.formatDateForInput(endDate),
        symbol: this.holiday.symbol
      });
    }
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  resetForm(): void {
    this.holidayForm.reset();
  }

  onSubmit(): void {
    if (this.holidayForm.invalid) {
      this.markFormGroupTouched(this.holidayForm);
      return;
    }

    const formData = this.holidayForm.value;

    if (this.isEditMode) {
      const editData: EditHoliday = {
        id: this.holidayForm.get('id')?.value,
        holidayTypeId: formData.holidayTypeId,
        start: new Date(formData.start).toISOString(),
        end: new Date(formData.end).toISOString(),
        symbol: formData.symbol
      };
      this.updateHoliday(editData);
    } else {
      const createData: CreateHoliday = {
        holidayTypeId: formData.holidayTypeId,
        start: new Date(formData.start).toISOString(),
        end: new Date(formData.end).toISOString(),
        symbol: formData.symbol
      };
      this.createHoliday(createData);
    }
  }

  createHoliday(data: CreateHoliday): void {
    this.holidayService.createHoliday(data).subscribe({
      next: (response: ApiResponse<Holiday>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'holidayForm.toasts.createSuccess'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'holidayForm.toasts.createError'
        });
      }
    });
  }

  updateHoliday(data: EditHoliday): void {
    this.holidayService.updateHoliday(data).subscribe({
      next: (response: ApiResponse<Holiday>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'holidayForm.toasts.updateSuccess'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'holidayForm.toasts.updateError'
        });
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
