import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { DesignationService } from '../DesignationService';
import { DesignationTypeService } from '../DesignationTypeService';
import { LookupService } from '../../organization/OrganizationService';
import { Designation, CreateDesignation, EditDesignation } from '../../../interfaces/designation.interface';
import { DesignationType } from '../../../interfaces/designation-type.interface';
import { Organization } from '../../../interfaces/organization.interface';
import { CommonModule } from '@angular/common';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-add-or-edit-designation',
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
  templateUrl: './add-or-edit-designation.html',
  styleUrl: './add-or-edit-designation.scss',
  providers: [MessageService]
})
export class AddOrEditDesignation implements OnInit {
  designationForm: FormGroup;
  isEditMode = false;
  designationId: number | null = null;
  loading = false;
  submitted = false;
  organizations: Organization[] = [];
  designations: Designation[] = [];
  parentDesignations: Designation[] = [];
  designationTypes: DesignationType[] = [];
  mainDesignations: Designation[] = [];
  isSuperAdmin = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private designationService: DesignationService,
    private designationTypeService: DesignationTypeService,
    private organizationService: LookupService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.designationForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      nameSE: ['', Validators.required],
      parentId: [null],
      organizationId: [null, Validators.required],
      designationsTypeLookupId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.isSuperAdmin = this.checkIsSuperAdmin();
    
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) this.designationForm.patchValue({ organizationId: +orgId });
    }

    this.loadOrganizations();
    this.loadDesignations();
    this.loadDesignationTypes();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.designationId = +params['id'];
        this.loadDesignation(this.designationId);
      }
    });

    this.designationForm.get('designationsTypeLookupId')?.valueChanges.subscribe(designationTypeId => {
      this.onDesignationTypeChange(designationTypeId);
    });
  }

  private checkIsSuperAdmin(): boolean {
    const claims = this.authService.getClaims();
    return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
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

  loadDesignations(): void {
    this.designationService.getAllDesignations().subscribe({
      next: (response: ApiResponse<Designation[]>) => {
        if (response.succeeded) {
          this.designations = response.data;
          this.updateParentDesignations();
          this.updateMainDesignations();
        }
      },
      error: (error) => {
        console.error('Error loading designations:', error);
      }
    });
  }

  loadDesignationTypes(): void {
    this.designationTypeService.getAllDesignationTypes().subscribe({
      next: (response: ApiResponse<DesignationType[]>) => {
        if (response.succeeded) {
          this.designationTypes = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading designation types:', error);
      }
    });
  }

  updateParentDesignations(): void {
    if (this.isEditMode && this.designationId) {
      this.parentDesignations = this.designations.filter(designation => designation.id !== this.designationId);
    } else {
      this.parentDesignations = this.designations;
    }
  }

  updateMainDesignations(): void {
    this.mainDesignations = this.designations.filter(designation => designation.designationsTypeLookupId === 1);
  }

  onDesignationTypeChange(designationsTypeLookupId: number): void {
    if (designationsTypeLookupId === 1) { 
      this.designationForm.get('parentId')?.setValue(null);
      this.designationForm.get('parentId')?.disable();
    } else if (designationsTypeLookupId === 2) { 
      this.designationForm.get('parentId')?.enable();
    }
  }

  loadDesignation(id: number): void {
    this.loading = true;
    this.designationService.getDesignationById(id).subscribe({
      next: (response: ApiResponse<Designation>) => {
        if (response.succeeded && response.data) {
          this.designationForm.patchValue({
            code: response.data.code,
            name: response.data.name,
            nameSE: response.data.nameSE,
            parentId: response.data.parentId,
            organizationId: response.data.organizationId,
            designationsTypeLookupId: response.data.designationsTypeLookupId
          });
          this.onDesignationTypeChange(response.data.designationsTypeLookupId || 0);
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load designation data'
        });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.designationForm.invalid) {
      this.markFormGroupTouched(this.designationForm);
      return;
    }

    this.loading = true;
    const formData = this.designationForm.value;

    if (this.isEditMode && this.designationId) {
      const editData: EditDesignation = {
        id: this.designationId,
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
        this.router.navigate(['/designations']);
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
        this.router.navigate(['/designations']);
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

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/designations']);
  }
}
