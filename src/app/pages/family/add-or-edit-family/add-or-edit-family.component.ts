import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { FamilyService } from '../FamilyService';
import { CreateFamily, EditFamily } from '@/interfaces/family.interface';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { ApiResponse } from '@/core/models/api-response.model';
import { LookupService } from '../../organization/OrganizationService';
import { AuthService } from '../../../auth/auth.service';
import { Organization } from '../../../interfaces/organization.interface';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-add-or-edit-family',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    ButtonModule, InputTextModule, ToastModule, SelectModule,
    TranslatePipe
  ],
  templateUrl: './add-or-edit-family.component.html',
  styleUrls: ['./add-or-edit-family.component.scss'],
  providers: [MessageService]
})
export class AddOrEditFamilyComponent implements OnInit {
  familyForm: FormGroup;
  isEditMode = false;
  familyId: number | null = null;
  loading = false;
  submitted = false;
  organizations: Organization[] = [];
  isSuperAdmin = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private familyService: FamilyService,
    private messageService: MessageService,
    private authService: AuthService, 
    private organizationService: LookupService 
  ) {
    this.familyForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      nameSE: ['', Validators.required],
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
        this.familyForm.patchValue({ organizationId: +orgId });
        this.familyForm.get('organizationId')?.disable();
      }
    }

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.familyId = +params['id'];
        this.loadFamily(this.familyId);
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

  loadFamily(id: number): void {
    this.loading = true;
    this.familyService.getFamilyById(id).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.familyForm.patchValue(response.data);
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load family data' });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
     if (this.familyForm.invalid) {
      this.markFormGroupTouched(this.familyForm);
      return;
    }

    this.loading = true;
    const formData = this.familyForm.getRawValue();

    if (this.isEditMode && this.familyId) {
      const editData: EditFamily = { id: this.familyId, ...formData };
      this.updateFamily(editData);
    } else {
      const createData: CreateFamily = formData;
      this.createFamily(createData);
    }
  }

  createFamily(data: CreateFamily): void {
    this.familyService.createFamily(data).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Family created successfully' });
        this.router.navigate(['/families']);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to create family' });
        this.loading = false;
      }
    });
  }

  updateFamily(data: EditFamily): void {
    this.familyService.updateFamily(data).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Family updated successfully' });
        this.router.navigate(['/families']);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to update family' });
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
    this.router.navigate(['/families']);
  }
}