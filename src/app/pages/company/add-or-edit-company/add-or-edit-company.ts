import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { CompanyService } from '../CompanyService';
import { CompanyTypeService } from '../CompanyTypeService';
import { LookupService } from '../../organization/OrganizationService';
import { Company, CreateCompany, EditCompany } from '@/interfaces/company.interface';
import { CompanyType } from '@/interfaces/company-type.interface';
import { Organization } from '@/interfaces/organization.interface';
import { ApiResponse } from '@/interfaces/apiResponse.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-or-edit-company',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToastModule,
  ],
  templateUrl: './add-or-edit-company.html',
  styleUrl: './add-or-edit-company.scss',
  providers: [MessageService]
})
export class AddOrEditCompany implements OnInit {
  companyForm: FormGroup;
  isEditMode = false;
  companyId: number | null = null;
  loading = false;
  submitted = false;
  organizations: Organization[] = [];
  companies: Company[] = [];
  companyTypes: CompanyType[] = [];
  mainCompanies: Company[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService,
    private companyTypeService: CompanyTypeService,
    private organizationService: LookupService,
    private messageService: MessageService
  ) {
    this.companyForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      nameSE: ['', Validators.required],
      parentId: [null],
      organizationId: [null, Validators.required],
      companyTypeId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadOrganizations();
    this.loadCompanies();
    this.loadCompanyTypes();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.companyId = +params['id'];
        this.loadCompany(this.companyId);
      }
    });

    // Watch for company type changes
    this.companyForm.get('companyTypeId')?.valueChanges.subscribe(companyTypeId => {
      this.onCompanyTypeChange(companyTypeId);
    });
  }

  loadOrganizations(): void {
    this.organizationService.getAllOrganizations().subscribe({
      next: (response: ApiResponse<Organization[]>) => {
        if (response.succeeded) {
          this.organizations = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
      }
    });
  }

  loadCompanies(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (response: ApiResponse<Company[]>) => {
        if (response.succeeded) {
          this.companies = response.data;
          this.updateMainCompanies();
        }
      },
      error: (error) => {
        console.error('Error loading companies:', error);
      }
    });
  }

  loadCompanyTypes(): void {
    this.companyTypeService.getAllCompanyTypes().subscribe({
      next: (response: ApiResponse<CompanyType[]>) => {
        if (response.succeeded) {
          this.companyTypes = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading company types:', error);
      }
    });
  }

  updateMainCompanies(): void {
    // Filter companies to show only Main Companies (companyTypeId = 1)
    this.mainCompanies = this.companies.filter(company => company.companyTypeId === 1);
  }

  onCompanyTypeChange(companyTypeId: number): void {
    if (companyTypeId === 1) { // Main Company
      // Hide parent company selection
      this.companyForm.get('parentId')?.setValue(null);
      this.companyForm.get('parentId')?.disable();
    } else if (companyTypeId === 2) { // Sub Company
      // Show parent company selection with only main companies
      this.companyForm.get('parentId')?.enable();
    }
  }

  loadCompany(id: number): void {
    this.loading = true;
    this.companyService.getCompanyById(id).subscribe({
      next: (response: ApiResponse<Company>) => {
        if (response.succeeded && response.data) {
          this.companyForm.patchValue({
            code: response.data.code,
            name: response.data.name,
            nameSE: response.data.nameSE,
            parentId: response.data.parentId,
            organizationId: response.data.organizationId,
            companyTypeId: response.data.companyTypeId
          });
          this.onCompanyTypeChange(response.data.companyTypeId || 0);
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load company data'
        });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.companyForm.invalid) {
      this.markFormGroupTouched(this.companyForm);
      return;
    }

    this.loading = true;
    const formData = this.companyForm.value;

    if (this.isEditMode && this.companyId) {
      const editData: EditCompany = {
        id: this.companyId,
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        parentId: formData.parentId,
        organizationId: formData.organizationId,
        companyTypeId: formData.companyTypeId
      };
      this.updateCompany(editData);
    } else {
      const createData: CreateCompany = {
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        parentId: formData.parentId,
        organizationId: formData.organizationId,
        companyTypeId: formData.companyTypeId
      };
      this.createCompany(createData);
    }
  }

  createCompany(data: CreateCompany): void {
    this.companyService.createCompany(data).subscribe({
      next: (response: ApiResponse<Company>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Company created successfully'
        });
        this.router.navigate(['/companies']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create company'
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
          summary: 'Success',
          detail: 'Company updated successfully'
        });
        this.router.navigate(['/companies']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update company'
        });
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/companies']);
  }
}
