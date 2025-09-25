import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Department, CreateDepartment, EditDepartment } from '../../../interfaces/department.interface';
import { DepartmentService } from '../DepartmentService';
import { Organization } from '../../../interfaces/organization.interface';
import { Company } from '../../../interfaces/company.interface';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';

@Component({
  selector: 'app-department-modal',
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
  templateUrl: './department-modal.component.html'
})
export class DepartmentModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() department: Department | null = null;
  @Input() organizations: Organization[] = [];
  @Input() companies: Company[] = [];
  @Input() isSuperAdmin: boolean = false;
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<Department>();
  @Output() onCancelEvent = new EventEmitter<void>();

  departmentForm: FormGroup;
  private translations: any = {};


  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private messageService: MessageService,
    private authService: AuthService,
    private translationService: TranslationService
  ) {
    this.departmentForm = this.createForm();
  }

  ngOnInit(): void {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dialogVisible'] && this.dialogVisible && this.isEditMode && this.department) {
      this.patchForm(this.department);
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
      companyId: [null, Validators.required]
    });
  }

  patchForm(department: Department): void {
    this.departmentForm.patchValue({
      id: department.id,
      code: department.code,
      name: department.name,
      nameSE: department.nameSE,
      parentId: department.parentId,
      organizationId: department.organizationId,
      companyId: department.companyId
    });
  }

  resetFormForCreate(): void {
    this.departmentForm.reset();
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.departmentForm.patchValue({ organizationId: +orgId });
        this.departmentForm.get('organizationId')?.disable();
      }
    } else {
      this.departmentForm.get('organizationId')?.enable();
    }
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) {
      this.markFormGroupTouched(this.departmentForm);
      return;
    }

    this.loading = true;
    const formData = this.departmentForm.getRawValue(); // Use getRawValue to include disabled fields

    if (this.isEditMode) {
      const editData: EditDepartment = {
        id: formData.id,
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        parentId: formData.parentId,
        organizationId: formData.organizationId,
        companyId: formData.companyId
      };
      this.updateDepartment(editData);
    } else {
      const createData: CreateDepartment = {
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        parentId: formData.parentId,
        organizationId: formData.organizationId,
        companyId: formData.companyId
      };
      this.createDepartment(createData);
    }
  }

  createDepartment(data: CreateDepartment): void {
    this.departmentService.createDepartment(data).subscribe({
      next: (response: ApiResponse<Department>) => {
        this.handleSuccess(this.translations.departmentForm?.toasts?.createSuccess || 'Department created successfully', response.data);
      },
      error: (error) => {
        this.handleError(this.translations.departmentForm?.toasts?.createError || 'Failed to create department');
      }
    });
  }

  updateDepartment(data: EditDepartment): void {
    this.departmentService.updateDepartment(data).subscribe({
      next: (response: ApiResponse<Department>) => {
        this.handleSuccess(this.translations.departmentForm?.toasts?.updateSuccess || 'Department updated successfully', response.data);
      },
      error: (error) => {
        this.handleError(this.translations.departmentForm?.toasts?.updateError || 'Failed to update department');
      }
    });
  }

  private handleSuccess(detail: string, data: Department): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translations.common?.success || 'Success',
      detail: detail
    });
    this.onSave.emit(data);
    this.closeDialog();
  }

  private handleError(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translations.common?.error || 'Error',
      detail: detail
    });
    this.loading = false;
  }


  closeDialog(): void {
    this.dialogVisibleChange.emit(false);
    this.departmentForm.get('organizationId')?.enable(); // Re-enable on close
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

