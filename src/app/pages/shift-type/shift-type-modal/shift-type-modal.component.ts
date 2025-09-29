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
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';

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
  private translations: any = {};

  constructor(
    private fb: FormBuilder,
    private shiftTypeService: ShiftTypeService,
    private messageService: MessageService,
    private authService: AuthService,
    private translationService: TranslationService
  ) {
    this.shiftTypeForm = this.createForm();
  }

  ngOnInit() {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });
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
      this.shiftTypeForm.patchValue(this.shiftType);
    }
  }

  resetForm(): void {
    this.shiftTypeForm.reset({ priority: 1 });
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
    const action = this.isEditMode ? this.updateShiftType(formData) : this.createShiftType(formData);
  }

  createShiftType(data: CreateShiftType): void {
    this.shiftTypeService.createShiftType(data).subscribe({
      next: (response: ApiResponse<ShiftType>) => this.handleSuccess(response, 'createSuccess'),
      error: (error) => this.handleError('createError')
    });
  }

  updateShiftType(data: EditShiftType): void {
    this.shiftTypeService.updateShiftType(data).subscribe({
      next: (response: ApiResponse<ShiftType>) => this.handleSuccess(response, 'updateSuccess'),
      error: (error) => this.handleError('updateError')
    });
  }

  private handleSuccess(response: ApiResponse<ShiftType>, messageKey: string): void {
    this.showToast('success', this.translations.common?.success, this.translations.shiftTypeForm?.toasts[messageKey]);
    this.onSave.emit(response.data);
    this.closeDialog();
  }

  private handleError(messageKey: string): void {
    this.showToast('error', this.translations.common?.error, this.translations.shiftTypeForm?.toasts[messageKey]);
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
