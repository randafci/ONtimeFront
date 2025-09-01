import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { DepartmentService } from '../DepartmentService';
import { DepartmentTypeService } from '../DepartmentTypeService';
import { CompanyService } from '../../company/CompanyService';
import { LookupService } from '../../organization/OrganizationService';
import { Department, CreateDepartment, EditDepartment } from '@/interfaces/department.interface';
import { DepartmentType } from '@/interfaces/department-type.interface';
import { Company } from '@/interfaces/company.interface';
import { Organization } from '@/interfaces/organization.interface';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@/pages/translation-manager/translation-manager/translation.service';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { ApiResponse } from '@/core/models/api-response.model';

@Component({
  selector: 'app-add-or-edit-department',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToastModule,
    TranslatePipe
  ],
  templateUrl: './add-or-edit-department.html',
  styleUrl: './add-or-edit-department.scss',
  providers: [MessageService]
})
export class AddOrEditDepartment implements OnInit {
  departmentForm: FormGroup;
  isEditMode = false;
  departmentId: number | null = null;
  loading = false;
  submitted = false;
  companies: Company[] = [];
  organizations: Organization[] = [];
  departments: Department[] = [];
  departmentTypes: DepartmentType[] = [];
  mainDepartments: Department[] = [];
  private translations: any = {}; // Store current translations
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private departmentTypeService: DepartmentTypeService,
    private companyService: CompanyService,
    private organizationService: LookupService,
    private messageService: MessageService,
    private translationService: TranslationService
  ) {
    this.departmentForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      nameSE: ['', Validators.required],
      parentId: [null],
      organizationId: [null, Validators.required],
      companyId: [null],
      departmentTypeLookupId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    // Subscribe to translation changes
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });

    this.loadOrganizations();
    this.loadCompanies();
    this.loadDepartments();
    this.loadDepartmentTypes();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.departmentId = +params['id'];
        this.loadDepartment(this.departmentId);
      }
    });

    // Watch for department type changes
    this.departmentForm.get('departmentTypeLookupId')?.valueChanges.subscribe(departmentTypeId => {
      this.onDepartmentTypeChange(departmentTypeId);
    });
  }

  loadOrganizations(): void {
    this.organizationService.getAllOrganizations().subscribe({
      next: (response: ApiResponse<Organization[]>) => {
        if (response.succeeded) {
          this.organizations = response.data||[];
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
          this.companies = response.data||[];
        }
      },
      error: (error) => {
        console.error('Error loading companies:', error);
      }
    });
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (response: ApiResponse<Department[]>) => {
        if (response.succeeded) {
          this.departments = response.data||[];
          this.updateMainDepartments();
        }
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  loadDepartmentTypes(): void {
    this.departmentTypeService.getAllDepartmentTypes().subscribe({
      next: (response: ApiResponse<DepartmentType[]>) => {
        if (response.succeeded) {
          this.departmentTypes = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading department types:', error);
      }
    });
  }

  updateMainDepartments(): void {
    // Filter departments to show only Main Departments (departmentTypeLookupId = 1)
    this.mainDepartments = this.departments.filter(department => department.departmentTypeLookupId === 1);
  }

  onDepartmentTypeChange(departmentTypeId: number): void {
    if (departmentTypeId === 1) { // Main Department
      // Hide parent department selection
      this.departmentForm.get('parentId')?.setValue(null);
      this.departmentForm.get('parentId')?.disable();
    } else if (departmentTypeId === 2) { // Sub Department
      // Show parent department selection with only main departments
      this.departmentForm.get('parentId')?.enable();
    }
  }

  loadDepartment(id: number): void {
    this.loading = true;
    this.departmentService.getDepartmentById(id).subscribe({
      next: (response: ApiResponse<Department>) => {
        if (response.succeeded && response.data) {
          this.departmentForm.patchValue({
            code: response.data.code,
            name: response.data.name,
            nameSE: response.data.nameSE,
            parentId: response.data.parentId,
            organizationId: response.data.organizationId,
            companyId: response.data.companyId,
            departmentTypeLookupId: response.data.departmentTypeLookupId
          });
          this.onDepartmentTypeChange(response.data.departmentTypeLookupId || 0);
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
          detail: this.translations.departmentForm?.toasts?.loadError || 'Failed to load department data'

        });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) {
      this.markFormGroupTouched(this.departmentForm);
      return;
    }

    this.loading = true;
    const formData = this.departmentForm.value;

    if (this.isEditMode && this.departmentId) {
      const editData: EditDepartment = {
        id: this.departmentId,
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        parentId: formData.parentId,
        organizationId: formData.organizationId,
        companyId: formData.companyId,
        departmentTypeLookupId: formData.departmentTypeLookupId
      };
      this.updateDepartment(editData);
    } else {
      const createData: CreateDepartment = {
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        parentId: formData.parentId,
        organizationId: formData.organizationId,
        companyId: formData.companyId,
        departmentTypeLookupId: formData.departmentTypeLookupId
      };
      this.createDepartment(createData);
    }
  }

  createDepartment(data: CreateDepartment): void {
    this.departmentService.createDepartment(data).subscribe({
      next: (response: ApiResponse<Department>) => {
        this.messageService.add({
          severity: 'success',
          summary: this.translations.common?.success || 'Success',
          detail: this.translations.departmentForm?.toasts?.createSuccess || 'Department created successfully'

        });
        this.router.navigate(['/departments']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
          detail: this.translations.departmentForm?.toasts?.createError || 'Failed to create department'

        });
        this.loading = false;
      }
    });
  }

  updateDepartment(data: EditDepartment): void {
    this.departmentService.updateDepartment(data).subscribe({
      next: (response: ApiResponse<Department>) => {
        this.messageService.add({
          severity: 'success',
          summary: this.translations.common?.success || 'Success',
          detail: this.translations.departmentForm?.toasts?.updateSuccess || 'Department updated successfully'

        });
        this.router.navigate(['/departments']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
          detail: this.translations.departmentForm?.toasts?.updateError || 'Failed to update department'

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
    this.router.navigate(['/departments']);
  }
}
