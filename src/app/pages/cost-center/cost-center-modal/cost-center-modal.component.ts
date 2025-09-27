import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { CostCenter, CreateCostCenter, EditCostCenter } from '../../../interfaces/cost-center.interface';
import { CostCenterService } from '../CostCenterService';
import { Organization } from '../../../interfaces/organization.interface';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-cost-center-modal',
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
  providers: [MessageService, TranslatePipe],
  templateUrl: './cost-center-modal.component.html'
})
export class CostCenterModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() costCenter: CostCenter | null = null;
  @Input() organizations: Organization[] = [];
  @Input() isSuperAdmin: boolean = false;
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<CostCenter>();
  @Output() onCancelEvent = new EventEmitter<void>();

  costCenterForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private costCenterService: CostCenterService,
    private messageService: MessageService,
    private authService: AuthService,
    private translatePipe: TranslatePipe
  ) {
    this.costCenterForm = this.createForm();
  }

  ngOnInit(): void {
    // Initialize form
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dialogVisible'] && this.dialogVisible && this.isEditMode && this.costCenter) {
      this.patchForm(this.costCenter);
    } else if (changes['dialogVisible'] && this.dialogVisible && !this.isEditMode) {
      this.resetFormForCreate();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      code: ['', Validators.required],
      name: ['', Validators.required],
      nameSE: ['', Validators.required],
      organizationId: [null, Validators.required]
    });
  }

  patchForm(costCenter: CostCenter): void {
    this.costCenterForm.patchValue({
      id: costCenter.id,
      code: costCenter.code,
      name: costCenter.name,
      nameSE: costCenter.nameSE,
      organizationId: costCenter.organizationId
    });
  }

  resetFormForCreate(): void {
    this.costCenterForm.reset();
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.costCenterForm.patchValue({ organizationId: +orgId });
        this.costCenterForm.get('organizationId')?.disable();
      }
    } else {
      this.costCenterForm.get('organizationId')?.enable();
    }
  }

  onSubmit(): void {
    if (this.costCenterForm.invalid) {
      this.markFormGroupTouched(this.costCenterForm);
      return;
    }

    this.loading = true;
    const formData = this.costCenterForm.getRawValue(); // Use getRawValue to include disabled fields

    if (this.isEditMode) {
      const editData: EditCostCenter = {
        id: formData.id,
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        organizationId: formData.organizationId
      };
      this.updateCostCenter(editData);
    } else {
      const createData: CreateCostCenter = {
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        organizationId: formData.organizationId
      };
      this.createCostCenter(createData);
    }
  }

  createCostCenter(data: CreateCostCenter): void {
    this.costCenterService.createCostCenter(data).subscribe({
      next: (response: ApiResponse<CostCenter>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'costCenterForm.toasts.createSuccess'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'costCenterForm.toasts.createError'
        });
        this.loading = false;
      }
    });
  }

  updateCostCenter(data: EditCostCenter): void {
    this.costCenterService.updateCostCenter(data).subscribe({
      next: (response: ApiResponse<CostCenter>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'costCenterForm.toasts.updateSuccess'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'costCenterForm.toasts.updateError'
        });
        this.loading = false;
      }
    });
  }

  closeDialog(): void {
    this.dialogVisibleChange.emit(false);
    this.costCenterForm.get('organizationId')?.enable(); // Re-enable on close
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

