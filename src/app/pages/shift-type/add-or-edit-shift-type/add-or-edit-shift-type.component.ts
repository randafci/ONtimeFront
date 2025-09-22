import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select'; 


import { LookupService } from '../../organization/OrganizationService'; 
import { ShiftTypeService } from '../shift-type.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { Organization } from '../../../interfaces/organization.interface';
import { ApiResponse } from '../../../core/models/api-response.model';
import { CreateShiftType, EditShiftType } from '../../../interfaces/shift-type.interface';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-add-or-edit-shift-type',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    ButtonModule, InputTextModule, ToastModule, InputNumberModule, SelectModule,
    TranslatePipe
  ],
  templateUrl: './add-or-edit-shift-type.component.html',
  styleUrls: ['./add-or-edit-shift-type.component.scss'],
  providers: [MessageService]
})
export class AddOrEditShiftTypeComponent implements OnInit {
  shiftTypeForm: FormGroup;
  isEditMode = false;
  shiftTypeId: number | null = null;
  loading = false;
  submitted = false;
  
  organizations: Organization[] = [];
  isSuperAdmin = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private shiftTypeService: ShiftTypeService,
    private messageService: MessageService,
    private authService: AuthService,
    private organizationService: LookupService 
  ) {
    this.shiftTypeForm = this.fb.group({
      name: ['', Validators.required],
      nameSE: ['', Validators.required],
      priority: [0, Validators.required],
      organizationId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.isSuperAdmin = this.checkIsSuperAdmin();
    
    if (this.isSuperAdmin) {
      this.loadOrganizations();
    } else {
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.shiftTypeForm.patchValue({ organizationId: +orgId });
        this.shiftTypeForm.get('organizationId')?.disable();
      }
    }

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.shiftTypeId = +params['id'];
        this.loadShiftType(this.shiftTypeId);
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
        if (response.succeeded && response.data) {
          this.organizations = response.data;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load organizations.' });
        }
      }
    });
  }

  loadShiftType(id: number): void {
    this.loading = true;
    this.shiftTypeService.getShiftTypeById(id).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.shiftTypeForm.patchValue(response.data);
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load shift type data' });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.shiftTypeForm.invalid) {
        this.markFormGroupTouched(this.shiftTypeForm);
        return;
    }

    this.loading = true;

    const formData = this.shiftTypeForm.getRawValue();

    if (this.isEditMode && this.shiftTypeId) {
      const editData: EditShiftType = { id: this.shiftTypeId, ...formData };
      this.updateShiftType(editData);
    } else {
      const createData: CreateShiftType = formData;
      this.createShiftType(createData);
    }
  }


  createShiftType(data: CreateShiftType): void {
    this.shiftTypeService.createShiftType(data).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Shift Type created successfully' });
        this.router.navigate(['/shift-types']);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to create shift type' });
        this.loading = false;
      }
    });
  }

  updateShiftType(data: EditShiftType): void {
    this.shiftTypeService.updateShiftType(data).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Shift Type updated successfully' });
        this.router.navigate(['/shift-types']);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to update shift type' });
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
    this.router.navigate(['/shift-types']);
  }
}