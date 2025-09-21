import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { GradeService } from '../GradeService';
import { CreateGrade, EditGrade } from '@/interfaces/grade.interface';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { ApiResponse } from '@/core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { LookupService } from '../../organization/OrganizationService';
import { Organization } from '../../../interfaces/organization.interface';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-add-or-edit-grade',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    ButtonModule, InputTextModule, ToastModule, SelectModule,
    TranslatePipe
  ],
  templateUrl: './add-or-edit-grade.component.html',
  styleUrls: ['./add-or-edit-grade.component.scss'],
  providers: [MessageService]
})
export class AddOrEditGradeComponent implements OnInit {
  gradeForm: FormGroup;
  isEditMode = false;
  gradeId: number | null = null;
  loading = false;
  submitted = false;
  organizations: Organization[] = [];
  isSuperAdmin = false;


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private gradeService: GradeService,
    private messageService: MessageService,
    private authService: AuthService, 
    private organizationService: LookupService 
  ) {
    this.gradeForm = this.fb.group({
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
        this.gradeForm.patchValue({ organizationId: +orgId });
        this.gradeForm.get('organizationId')?.disable();
      }
    }

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.gradeId = +params['id'];
        this.loadGrade(this.gradeId);
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

  loadGrade(id: number): void {
    this.loading = true;
    this.gradeService.getGradeById(id).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.gradeForm.patchValue(response.data);
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load grade data' });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.gradeForm.invalid) {
      this.markFormGroupTouched(this.gradeForm);
      return;
    }

    this.loading = true;
    const formData = this.gradeForm.getRawValue();


    if (this.isEditMode && this.gradeId) {
      const editData: EditGrade = { id: this.gradeId, ...formData };
      this.updateGrade(editData);
    } else {
      const createData: CreateGrade = formData;
      this.createGrade(createData);
    }
  }

  createGrade(data: CreateGrade): void {
    this.gradeService.createGrade(data).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Grade created successfully' });
        this.router.navigate(['/grades']);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to create grade' });
        this.loading = false;
      }
    });
  }

  updateGrade(data: EditGrade): void {
    this.gradeService.updateGrade(data).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Grade updated successfully' });
        this.router.navigate(['/grades']);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to update grade' });
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
    this.router.navigate(['/grades']);
  }
}