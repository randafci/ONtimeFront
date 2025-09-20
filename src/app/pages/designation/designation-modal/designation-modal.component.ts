import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Designation, CreateDesignation, EditDesignation } from '../../../interfaces/designation.interface';
import { DesignationService } from '../DesignationService';
import { DesignationTypeService } from '../DesignationTypeService';
import { DesignationType } from '../../../interfaces/designation-type.interface';
import { Organization } from '../../../interfaces/organization.interface';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-designation-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ButtonModule
  ],
  providers: [MessageService],
  templateUrl: './designation-modal.component.html'
})
export class DesignationModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() designation: Designation | null = null;
  @Input() organizations: Organization[] = [];
  @Input() designationTypes: DesignationType[] = [];
  @Input() mainDesignations: Designation[] = [];
  @Input() isSuperAdmin: boolean = false;
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<Designation>();
  @Output() onCancelEvent = new EventEmitter<void>();

  designationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private designationService: DesignationService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.designationForm = this.createForm();
  }

  ngOnInit(): void {
    // Initialize form
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dialogVisible'] && this.dialogVisible && this.isEditMode && this.designation) {
      this.patchForm(this.designation);
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
      parentId: [null],
      organizationId: [null, Validators.required],
      designationsTypeLookupId: [null, Validators.required]
    });
  }

  patchForm(designation: Designation): void {
    this.designationForm.patchValue({
      id: designation.id,
      code: designation.code,
      name: designation.name,
      nameSE: designation.nameSE,
      parentId: designation.parentId,
      organizationId: designation.organizationId,
      designationsTypeLookupId: designation.designationsTypeLookupId
    });
    this.onDesignationTypeChange(designation.designationsTypeLookupId || 0);
  }

  resetFormForCreate(): void {
    this.designationForm.reset();
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.designationForm.patchValue({ organizationId: +orgId });
        this.designationForm.get('organizationId')?.disable();
      }
    } else {
      this.designationForm.get('organizationId')?.enable();
    }
  }

  onDesignationTypeChange(designationsTypeLookupId: number): void {
    if (designationsTypeLookupId === 1) {
      this.designationForm.get('parentId')?.setValue(null);
      this.designationForm.get('parentId')?.disable();
    } else if (designationsTypeLookupId === 2) {
      this.designationForm.get('parentId')?.enable();
    }
  }

  onSubmit(): void {
    if (this.designationForm.invalid) {
      this.markFormGroupTouched(this.designationForm);
      return;
    }

    this.loading = true;
    const formData = this.designationForm.getRawValue(); // Use getRawValue to include disabled fields

    if (this.isEditMode) {
      const editData: EditDesignation = {
        id: formData.id,
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        parentId: formData.parentId,
        organizationId: formData.organizationId,
        designationsTypeLookupId: formData.designationsTypeLookupId
      };
      this.updateDesignation(editData);
    } else {
      const createData: CreateDesignation = {
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        parentId: formData.parentId,
        organizationId: formData.organizationId,
        designationsTypeLookupId: formData.designationsTypeLookupId
      };
      this.createDesignation(createData);
    }
  }

  createDesignation(data: CreateDesignation): void {
    this.designationService.createDesignation(data).subscribe({
      next: (response: ApiResponse<Designation>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Designation created successfully'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create designation'
        });
        this.loading = false;
      }
    });
  }

  updateDesignation(data: EditDesignation): void {
    this.designationService.updateDesignation(data).subscribe({
      next: (response: ApiResponse<Designation>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Designation updated successfully'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update designation'
        });
        this.loading = false;
      }
    });
  }

  closeDialog(): void {
    this.dialogVisibleChange.emit(false);
    this.designationForm.get('organizationId')?.enable(); // Re-enable on close
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

