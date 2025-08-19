import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { CompanyService } from '../CompanyService';
import { LookupService } from '../../organization/OrganizationService';
import { Company, CreateCompany, EditCompany } from '@/interfaces/company.interface';
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
    InputNumberModule,
    SelectModule,
    CheckboxModule,
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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService,
    private organizationService: LookupService,
    private messageService: MessageService
  ) {
    this.companyForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      nameSE: ['', Validators.required],
      index: [0, Validators.required],
      parentId: [null],
      fromIntegration: [false],
      organizationId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadOrganizations();
    this.loadCompanies();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.companyId = +params['id'];
        this.loadCompany(this.companyId);
      }
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
        }
      },
      error: (error) => {
        console.error('Error loading companies:', error);
      }
    });
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
            index: response.data.index,
            parentId: response.data.parentId,
            fromIntegration: response.data.fromIntegration,
            organizationId: response.data.organizationId
          });
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
        index: formData.index,
        parentId: formData.parentId,
        fromIntegration: formData.fromIntegration,
        organizationId: formData.organizationId
      };
      this.updateCompany(editData);
    } else {
      const createData: CreateCompany = {
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        index: formData.index,
        parentId: formData.parentId,
        fromIntegration: formData.fromIntegration,
        organizationId: formData.organizationId
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
