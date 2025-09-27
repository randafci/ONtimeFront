import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { LookupService } from '../OrganizationService';
import { Organization, CreateOrganization, EditOrganization } from '../../../interfaces/organization.interface';
import { CommonModule } from '@angular/common';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';

@Component({
  selector: 'app-add-or-edit-organization',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    TranslatePipe
  ],
  templateUrl: './add-or-edit-organization.html',
  styleUrl: './add-or-edit-organization.scss',
  providers: [MessageService]
})
export class AddOrEditOrganization implements OnInit {
  organizationForm: FormGroup;
  isEditMode = false;
  organizationId: number | null = null;
  loading = false;
  submitted = false;
  private translations: any = {};

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private lookupService: LookupService,
    private messageService: MessageService,
    private translationService: TranslationService
  ) {
    this.organizationForm = this.fb.group({
      name: ['', Validators.required],
      nameSE: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.translationService.translations$.subscribe(trans => {
      this.translations = trans;
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.organizationId = +params['id'];
        this.loadOrganization(this.organizationId);
      }
    });
  }

  loadOrganization(id: number): void {
    this.loading = true;
    this.lookupService.getOrganizationById(id).subscribe({
      next: (response: ApiResponse<Organization>) => {
        if (response.succeeded && response.data) {
          this.organizationForm.patchValue({
            name: response.data.name,
            nameSE: response.data.nameSE
          });
        } else {
           this.messageService.add({
            severity: 'error',
            summary: this.translations.common?.error || 'Error',
            detail: this.translations.organizations?.formPage?.toasts?.loadError || 'Failed to load organization data'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
            detail: this.translations.organizations?.formPage?.toasts?.loadError || 'Failed to load organization data'
        });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.organizationForm.invalid) {
      this.markFormGroupTouched(this.organizationForm);
      return;
    }

    this.loading = true;
    const formData = this.organizationForm.value;

    if (this.isEditMode && this.organizationId) {
      const editData: EditOrganization = {
        id: this.organizationId,
        name: formData.name,
        nameSE: formData.nameSE
      };
      this.updateOrganization(editData);
    } else {
      const createData: CreateOrganization = {
        name: formData.name,
        nameSE: formData.nameSE
      };
      this.createOrganization(createData);
    }
  }

  createOrganization(data: CreateOrganization): void {
    this.lookupService.createOrganization(data).subscribe({
      next: (response: ApiResponse<Organization>) => {
        this.messageService.add({
          severity: 'success',
          summary: this.translations.common?.success || 'Success',
          detail: this.translations.organizations?.formPage?.toasts?.createSuccess || 'Organization created successfully'
        });
        this.router.navigate(['/organizations']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
          detail: this.translations.organizations?.formPage?.toasts?.createError || 'Failed to create organization'
        });
        this.loading = false;
      }
    });
  }

  updateOrganization(data: EditOrganization): void {
    this.lookupService.updateOrganization(data).subscribe({
      next: (response: ApiResponse<Organization>) => {
        this.messageService.add({
          severity: 'success',
          summary: this.translations.common?.success || 'Success',
          detail: this.translations.organizations?.formPage?.toasts?.updateSuccess || 'Organization updated successfully'
        });
        this.router.navigate(['/organizations']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
          detail: this.translations.organizations?.formPage?.toasts?.updateError || 'Failed to update organization'
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
    this.router.navigate(['/organizations']);
  }
}