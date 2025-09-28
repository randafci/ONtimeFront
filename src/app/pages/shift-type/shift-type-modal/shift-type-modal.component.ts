import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { ShiftType, CreateShiftType, EditShiftType } from '../../../interfaces/shift-type.interface';
import { ShiftTypeService } from '../shift-type.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { Organization } from '../../../interfaces/organization.interface';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-shift-type-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    InputNumberModule,
    TranslatePipe
  ],
  providers: [MessageService],
  templateUrl: './shift-type-modal.component.html',
})
export class ShiftTypeModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() shiftType: ShiftType | null = null;
  @Input() organizations: Organization[] = [];
  @Input() isSuperAdmin: boolean = false;
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<ShiftType>();
  @Output() onCancelEvent = new EventEmitter<void>();

  shiftTypeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private shiftTypeService: ShiftTypeService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.shiftTypeForm = this.createForm();
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.dialogVisible && this.shiftType) {
      this.loadShiftTypeData();
    } else if (this.dialogVisible && !this.isEditMode) {
      this.resetForm();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      nameSE: ['', [Validators.required, Validators.maxLength(200)]],
      priority: [1, [Validators.required, Validators.min(1)]],
      organizationId: [null, Validators.required]
    });
  }

  loadShiftTypeData(): void {
    if (this.shiftType) {
      this.shiftTypeForm.patchValue({
        id: this.shiftType.id,
        name: this.shiftType.name,
        nameSE: this.shiftType.nameSE,
        priority: this.shiftType.priority,
        organizationId: this.shiftType.organizationId
      });
    }
  }

  resetForm(): void {
    this.shiftTypeForm.reset();
    this.shiftTypeForm.patchValue({
      priority: 1
    });
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.shiftTypeForm.patchValue({ organizationId: +orgId });
      }
    }
  }

  onSubmit(): void {
    if (this.shiftTypeForm.invalid) {
      this.markFormGroupTouched(this.shiftTypeForm);
      return;
    }

    const formData = this.shiftTypeForm.value;

    if (this.isEditMode) {
      const editData: EditShiftType = {
        id: this.shiftTypeForm.get('id')?.value,
        name: formData.name,
        nameSE: formData.nameSE,
        priority: formData.priority,
        organizationId: formData.organizationId
      };
      this.updateShiftType(editData);
    } else {
      const createData: CreateShiftType = {
        name: formData.name,
        nameSE: formData.nameSE,
        priority: formData.priority,
        organizationId: formData.organizationId
      };
      this.createShiftType(createData);
    }
  }

  createShiftType(data: CreateShiftType): void {
    this.shiftTypeService.createShiftType(data).subscribe({
      next: (response: ApiResponse<ShiftType>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Shift type created successfully'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create shift type'
        });
      }
    });
  }

  updateShiftType(data: EditShiftType): void {
    this.shiftTypeService.updateShiftType(data).subscribe({
      next: (response: ApiResponse<ShiftType>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Shift type updated successfully'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update shift type'
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
