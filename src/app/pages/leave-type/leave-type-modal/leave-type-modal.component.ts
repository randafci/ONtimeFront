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
import { LeaveTypeService } from '../LeaveTypeService';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { Organization } from '../../../interfaces/organization.interface';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

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
    TranslatePipe
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
  private translations: any = {};

  constructor(
    private fb: FormBuilder,
    private leaveTypeService: LeaveTypeService,
    private messageService: MessageService,
    private authService: AuthService,
    private translationService: TranslationService
  ) {
    this.leaveTypeForm = this.createForm();
  }

  ngOnInit() {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });
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
      isDeleted: [false],
      organizationId: [null, Validators.required]
    });
  }

  loadLeaveTypeData(): void {
    if (this.leaveType) {
      this.leaveTypeForm.patchValue(this.leaveType);
    }
  }

  resetForm(): void {
    this.leaveTypeForm.reset({ 
      isAttachmentRequired: false, 
      isCommentRequired: false,
      isDeleted: false,
      id: null
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
    const action = this.isEditMode ? this.updateLeaveType(formData) : this.createLeaveType(formData);
  }

  createLeaveType(data: any): void {
    // For create, remove id and set isDeleted to false
    const createData: LeaveType = {
      ...data,
      id: 0, // Backend will ignore this for create
      isDeleted: false
    };
    this.leaveTypeService.createLeaveType(createData).subscribe({
      next: (response: ApiResponse<LeaveType>) => this.handleSuccess(response, 'createSuccess'),
      error: (error) => this.handleError('createError')
    });
  }

  updateLeaveType(data: any): void {
    // For update, use the existing id
    const updateData: LeaveType = {
      ...data,
      id: this.leaveType!.id
    };
    this.leaveTypeService.updateLeaveType(this.leaveType!.id, updateData).subscribe({
      next: (response: ApiResponse<LeaveType>) => this.handleSuccess(response, 'updateSuccess'),
      error: (error) => this.handleError('updateError')
    });
  }

  private handleSuccess(response: ApiResponse<LeaveType>, messageKey: string): void {
    this.showToast('success', this.translations.common?.success, this.translations.leaveTypeForm?.toasts[messageKey]);
    this.onSave.emit(response.data);
    this.closeDialog();
  }

  private handleError(messageKey: string): void {
    this.showToast('error', this.translations.common?.error, this.translations.leaveTypeForm?.toasts[messageKey]);
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
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
      if (control instanceof FormGroup) this.markFormGroupTouched(control);
    });
  }
}
