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
import { DepartmentService } from '../DepartmentService';
import { CompanyService } from '../../company/CompanyService';
import { LookupService } from '../../organization/OrganizationService';
import { Department, CreateDepartment, EditDepartment } from '@/interfaces/department.interface';
import { Company } from '@/interfaces/company.interface';
import { Organization } from '@/interfaces/organization.interface';
import { ApiResponse } from '@/interfaces/apiResponse.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-or-edit-department',
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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private companyService: CompanyService,
    private organizationService: LookupService,
    private messageService: MessageService
  ) {
    this.departmentForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      nameSE: ['', Validators.required],
      index: [0, Validators.required],
      parentId: [null],
      departmentType: [null],
      fromIntegration: [false],
      organizationId: [null, Validators.required],
      companyId: [null]
    });
  }

  ngOnInit(): void {
    this.loadOrganizations();
    this.loadCompanies();
    this.loadDepartments();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.departmentId = +params['id'];
        this.loadDepartment(this.departmentId);
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

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (response: ApiResponse<Department[]>) => {
        if (response.succeeded) {
          this.departments = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
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
            index: response.data.index,
            parentId: response.data.parentId,
            departmentType: response.data.departmentType,
            fromIntegration: response.data.fromIntegration,
            organizationId: response.data.organizationId,
            companyId: response.data.companyId
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load department data'
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
        index: formData.index,
        parentId: formData.parentId,
        departmentType: formData.departmentType,
        fromIntegration: formData.fromIntegration,
        organizationId: formData.organizationId,
        companyId: formData.companyId
      };
      this.updateDepartment(editData);
    } else {
      const createData: CreateDepartment = {
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        index: formData.index,
        parentId: formData.parentId,
        departmentType: formData.departmentType,
        fromIntegration: formData.fromIntegration,
        organizationId: formData.organizationId,
        companyId: formData.companyId
      };
      this.createDepartment(createData);
    }
  }

  createDepartment(data: CreateDepartment): void {
    this.departmentService.createDepartment(data).subscribe({
      next: (response: ApiResponse<Department>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Department created successfully'
        });
        this.router.navigate(['/departments']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create department'
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
          summary: 'Success',
          detail: 'Department updated successfully'
        });
        this.router.navigate(['/departments']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update department'
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
