import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { CostCenterService } from '../CostCenterService';
import { LookupService } from '../../organization/OrganizationService';
import { CostCenter, CreateCostCenter, EditCostCenter } from '../../../interfaces/cost-center.interface';
import { Organization } from '../../../interfaces/organization.interface';
import { CommonModule } from '@angular/common';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-add-or-edit-cost-center',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToastModule,
    CheckboxModule,
    TranslatePipe,
  ],
  templateUrl: './add-or-edit-cost-center.html',
  providers: [MessageService]
})
export class AddOrEditCostCenter implements OnInit {
  costCenterForm: FormGroup;
  isEditMode = false;
  costCenterId: number | null = null;
  loading = false;
  submitted = false;
  organizations: Organization[] = [];
  isSuperAdmin = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private costCenterService: CostCenterService,
    private organizationService: LookupService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.costCenterForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      nameSE: ['', Validators.required],
      organizationId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.isSuperAdmin = this.checkIsSuperAdmin();
    
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) this.costCenterForm.patchValue({ organizationId: +orgId });
    }

    this.loadOrganizations();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.costCenterId = +params['id'];
        this.loadCostCenter(this.costCenterId);
      }
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

  loadCostCenter(id: number): void {
    this.loading = true;
    this.costCenterService.getCostCenterById(id).subscribe({
      next: (response: ApiResponse<CostCenter>) => {
        if (response.succeeded && response.data) {
        this.costCenterForm.patchValue({
          code: response.data.code,
          name: response.data.name,
          nameSE: response.data.nameSE,
          organizationId: response.data.organizationId
        });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load cost center data'
        });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.costCenterForm.invalid) {
      this.markFormGroupTouched(this.costCenterForm);
      return;
    }

    this.loading = true;
    const formData = this.costCenterForm.value;

    if (this.isEditMode && this.costCenterId) {
      const editData: EditCostCenter = {
        id: this.costCenterId,
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
          detail: 'Cost center created successfully'
        });
        this.router.navigate(['/cost-centers']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create cost center'
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
          detail: 'Cost center updated successfully'
        });
        this.router.navigate(['/cost-centers']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update cost center'
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
    this.router.navigate(['/cost-centers']);
  }
}
