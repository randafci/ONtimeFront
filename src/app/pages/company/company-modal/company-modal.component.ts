import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Company, CreateCompany, EditCompany } from '../../../interfaces/company.interface';
import { CompanyService } from '../CompanyService';
import { CompanyTypeService } from '../CompanyTypeService';
import { LookupService } from '../../organization/OrganizationService';
import { CompanyType } from '../../../interfaces/company-type.interface';
import { Organization } from '../../../interfaces/organization.interface';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';

@Component({
  selector: 'app-company-modal',
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
  templateUrl: './company-modal.component.html',
})
export class CompanyModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() company: Company | null = null;
  @Input() companies: Company[] = [];
  @Input() organizations: Organization[] = [];
  @Input() companyTypes: CompanyType[] = [];
  @Input() isSuperAdmin: boolean = false;
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<Company>();
  @Output() onCancelEvent = new EventEmitter<void>();

  companyForm: FormGroup;
  mainCompanies: Company[] = [];
  private translations: any = {};

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private companyTypeService: CompanyTypeService,
    private organizationService: LookupService,
    private messageService: MessageService,
    private authService: AuthService,
    private translationService: TranslationService
  ) {
    this.companyForm = this.createForm();
  }

  ngOnInit() {
    this.translationService.translations$.subscribe(trans => {
      this.translations = trans;
    });
    this.updateMainCompanies();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['companies']) {
      this.updateMainCompanies();
    }
    
    if (changes['dialogVisible'] && this.dialogVisible) {
      this.loading = false;
      
      if (this.isEditMode && this.company) {
        this.loadCompanyData();
      } else if (!this.isEditMode) {
        this.resetForm();
      }
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
      companyTypeLookupId: [null, Validators.required]
    });
  }

  updateMainCompanies(): void {
    this.mainCompanies = this.companies.filter(company => company.companyTypeLookupId === 1);
  }

  loadCompanyData(): void {
    if (this.company) {
      this.companyForm.patchValue({
        id: this.company.id,
        code: this.company.code,
        name: this.company.name,
        nameSE: this.company.nameSE,
        parentId: this.company.parentId,
        organizationId: this.company.organizationId,
        companyTypeLookupId: this.company.companyTypeLookupId
      });
      this.onCompanyTypeChange(this.company.companyTypeLookupId || 0);
    }
  }

  resetForm(): void {
    this.companyForm.reset();
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) this.companyForm.patchValue({ organizationId: +orgId });
    }
  }

  onCompanyTypeChange(companyTypeLookupId: number): void {
    if (companyTypeLookupId === 1) {
      this.companyForm.get('parentId')?.setValue(null);
      this.companyForm.get('parentId')?.disable();
    } else if (companyTypeLookupId === 2) {
      this.companyForm.get('parentId')?.enable();
    }
  }

  onSubmit(): void {
    if (this.companyForm.invalid) {
      this.markFormGroupTouched(this.companyForm);
      return;
    }

    this.loading = true;
    const formData = this.companyForm.value;

    if (this.isEditMode) {
      const editData: EditCompany = {
        id: this.companyForm.get('id')?.value,
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        parentId: formData.parentId,
        organizationId: formData.organizationId,
        companyTypeLookupId: formData.companyTypeLookupId
      };
      this.updateCompany(editData);
    } else {
      const createData: CreateCompany = {
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        parentId: formData.parentId,
        organizationId: formData.organizationId,
        companyTypeLookupId: formData.companyTypeLookupId
      };
      this.createCompany(createData);
    }
  }

  createCompany(data: CreateCompany): void {
    this.companyService.createCompany(data).subscribe({
      next: (response: ApiResponse<Company>) => {
        this.messageService.add({
          severity: 'success',
          summary: this.translations.common?.success || 'Success',
          detail: this.translations.companies?.formPage?.toasts?.createSuccess || 'Company created successfully'
        });
        this.loading = false;
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
          detail: this.translations.companies?.formPage?.toasts?.createError || 'Failed to create company'
        });
        this.loading = false;
      }
    });
  }

  updateCompany(data: EditCompany): void {
    this.companyService.updateCompany(data).subscribe({
      next: (response: ApiResponse<Company>) => {
        this.messageService.add({
          severity: 'success',
          summary: this.translations.common?.success || 'Success',
          detail: this.translations.companies?.formPage?.toasts?.updateSuccess || 'Company updated successfully'
        });
        this.loading = false;
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
          detail: this.translations.companies?.formPage?.toasts?.updateError || 'Failed to update company'
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
