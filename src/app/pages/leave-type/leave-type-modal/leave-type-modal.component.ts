import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { LeaveType } from '../../../interfaces/leave-type.interface';
import { LeaveTypeService, CreateLeaveType, EditLeaveType } from '../LeaveTypeService';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { Organization } from '../../../interfaces/organization.interface';

@Component({
  selector: 'app-leave-type-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    CheckboxModule,
  ],
  providers: [MessageService],
  templateUrl: './leave-type-modal.component.html',
})
export class LeaveTypeModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() leaveType: LeaveType | null = null;
  @Input() organizations: Organization[] = [];
  @Input() isSuperAdmin: boolean = false;
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<LeaveType>();
  @Output() onCancelEvent = new EventEmitter<void>();

  leaveTypeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private leaveTypeService: LeaveTypeService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.leaveTypeForm = this.createForm();
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.dialogVisible && this.leaveType) {
      this.loadLeaveTypeData();
    } else if (this.dialogVisible && !this.isEditMode) {
      this.resetForm();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      code: ['', [Validators.required, Validators.maxLength(100)]],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      nameSE: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(500)]],
      symbol: ['', [Validators.required]],
      reason: ['', [Validators.required, Validators.maxLength(500)]],
      isAttachmentRequired: [false],
      isCommentRequired: [false],
      organizationId: [null, Validators.required]
    });
  }

  loadLeaveTypeData(): void {
    if (this.leaveType) {
      this.leaveTypeForm.patchValue({
        id: this.leaveType.id,
        code: this.leaveType.code,
        name: this.leaveType.name,
        nameSE: this.leaveType.nameSE,
        description: this.leaveType.description,
        symbol: this.leaveType.symbol,
        reason: this.leaveType.reason,
        isAttachmentRequired: this.leaveType.isAttachmentRequired,
        isCommentRequired: this.leaveType.isCommentRequired,
        organizationId: this.leaveType.organizationId
      });
    }
  }

  resetForm(): void {
    this.leaveTypeForm.reset();
    // Set default values for boolean fields
    this.leaveTypeForm.patchValue({
      isAttachmentRequired: false,
      isCommentRequired: false
    });
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.leaveTypeForm.patchValue({ organizationId: +orgId });
      }
    }
  }

  onSubmit(): void {
    if (this.leaveTypeForm.invalid) {
      this.markFormGroupTouched(this.leaveTypeForm);
      return;
    }

    const formData = this.leaveTypeForm.value;

    if (this.isEditMode) {
      const editData: EditLeaveType = {
        id: this.leaveTypeForm.get('id')?.value,
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        description: formData.description || '',
        symbol: formData.symbol,
        reason: formData.reason,
        isAttachmentRequired: Boolean(formData.isAttachmentRequired),
        isCommentRequired: Boolean(formData.isCommentRequired),
        organizationId: formData.organizationId
      };
      this.updateLeaveType(editData);
    } else {
      const createData: CreateLeaveType = {
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        description: formData.description || '',
        symbol: formData.symbol,
        reason: formData.reason,
        isAttachmentRequired: Boolean(formData.isAttachmentRequired),
        isCommentRequired: Boolean(formData.isCommentRequired),
        organizationId: formData.organizationId
      };
      this.createLeaveType(createData);
    }
  }

  createLeaveType(data: CreateLeaveType): void {
    this.leaveTypeService.createLeaveType(data).subscribe({
      next: (response: ApiResponse<LeaveType>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Leave type created successfully'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create leave type'
        });
      }
    });
  }

  updateLeaveType(data: EditLeaveType): void {
    this.leaveTypeService.updateLeaveType(data).subscribe({
      next: (response: ApiResponse<LeaveType>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Leave type updated successfully'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update leave type'
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
