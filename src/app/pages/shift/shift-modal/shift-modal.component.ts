// src/app/features/attendance/shifts/shift-modal/shift-modal.component.ts

import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
// PrimeNG Modules
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { CreateShiftDto, Shift, UpdateShiftDto } from '../../../interfaces/shift.interface';
import { Organization } from '../../../interfaces/organization.interface';
import { ShiftType } from '../../../interfaces/shift-type.interface';
import { ApiResponse } from '../../../core/models/api-response.model';
import { ShiftService } from '../ShiftService';
import { AuthService } from '../../../auth/auth.service';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { CheckboxModule } from 'primeng/checkbox';
import { Toast } from "primeng/toast";

// Project Specific Imports


@Component({
  selector: 'app-shift-modal',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TranslatePipe,
    DialogModule, SelectModule, ButtonModule, CheckboxModule,
    Toast
],
  providers: [MessageService], // Provide MessageService here if not already provided in root
  templateUrl: './shift-modal.component.html'
})
export class ShiftModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() shift: Shift | null = null;
  @Input() organizations: Organization[] = [];
  @Input() shiftTypes: ShiftType[] = [];
  @Input() isSuperAdmin: boolean = false;
  @Input() loading: boolean = false; // Add loading input

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<Shift>();
  @Output() onCancelEvent = new EventEmitter<void>();

  shiftForm: FormGroup;
  private translations: any = {};

  constructor(
    private fb: FormBuilder,
    private shiftService: ShiftService,
    private messageService: MessageService,
    private authService: AuthService,
    private translationService: TranslationService
  ) {
    this.shiftForm = this.createForm();
  }

  ngOnInit(): void {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.dialogVisible) {
      if (this.isEditMode && this.shift) {
        this.loadShiftData();
      } else {
        this.resetForm();
      }
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      shiftTypeId: [null, Validators.required],
      organizationId: [null, Validators.required],
      isDefaultShift: [false]
    });
  }

  loadShiftData(): void {
    if (this.shift) {
      this.shiftForm.patchValue(this.shift);
    }
  }

  resetForm(): void {
    this.shiftForm.reset({ isDefaultShift: false });
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.shiftForm.patchValue({ organizationId: +orgId });
        this.shiftForm.get('organizationId')?.disable();
      }
    } else {
        this.shiftForm.get('organizationId')?.enable();
    }
  }

  onSubmit(): void {
    if (this.shiftForm.invalid) {
      this.markFormGroupTouched(this.shiftForm);
      return;
    }

    this.loading = true;
    const formData = this.shiftForm.getRawValue();

    if (this.isEditMode) {
    // For an update, the ID is required. This is correct.
    this.updateShift(formData);
} else {
    // For a create, ensure you are sending an object without an ID.
    const createData: CreateShiftDto = {
        shiftTypeId: formData.shiftTypeId,
        organizationId: formData.organizationId,
        isDefaultShift: formData.isDefaultShift
    };
    this.createShift(createData); // Pass the clean object
}
  }

createShift(data: CreateShiftDto): void {
  this.shiftService.createShift(data).subscribe({
    next: (response) => this.handleSuccess(response, 'createSuccess'),
    error: (error) => {
      const backendMessage = error?.error?.message || 'An unexpected error occurred.';
      this.handleError(backendMessage);
    }
  });
}


  updateShift(data: UpdateShiftDto): void {
    this.shiftService.updateShift(data).subscribe({
      next: (response) => this.handleSuccess(response, 'updateSuccess'),
      error: () => this.handleError('updateError')
    });
  }

  private handleSuccess(response: ApiResponse<Shift>, messageKey: string): void {
    this.loading = false;
    if (response.succeeded) {
      // FIX: Provide fallback values for summary and detail
      const summary = this.translations.common?.success || 'Success';
      const detail = this.translations.shiftForm?.toasts?.[messageKey] || 'Operation completed successfully.';
      this.showToast('success', summary, detail);
      
      this.onSave.emit(response.data);
      this.closeDialog();
    } else {
      // FIX: Provide fallback values for summary and the response message
      const summary = this.translations.common?.error || 'Error';
      const detail = response.message || 'An error occurred.';
      this.showToast('error', summary, detail);
    }
  }

  private handleError(messageKey: string): void {
    this.loading = false;
    // FIX: Provide fallback values for summary and detail
    const summary = this.translations.common?.error || 'Error';
    const detail = this.translations.shiftForm?.toasts?.[messageKey] || 'An unexpected error occurred.';
    this.showToast('error', summary, detail);
  }
  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail: detail || 'An error occurred.' });
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