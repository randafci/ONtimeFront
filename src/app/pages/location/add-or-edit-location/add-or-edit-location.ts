import { AuthService } from '@/auth/auth.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { EditLocation, CreateLocation, Location } from '@/interfaces/location.interface';
import { Organization } from '@/interfaces/organization.interface';
import { LookupService } from '@/pages/organization/OrganizationService';
import { TranslationService } from '@/pages/translation-manager/translation-manager/translation.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { LocationService } from '../location.service';

@Component({
  selector: 'app-add-or-edit-location',
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
  templateUrl: './add-or-edit-location.html',
  styleUrl: './add-or-edit-location.scss',
  providers: [MessageService]
})
export class AddOrEditLocation implements OnInit {
  locationForm: FormGroup;
  isEditMode = false;
  locationId: number | null = null;
  loading = false;
  submitted = false;
  organizations: Organization[] = [];
  isSuperAdmin = false;
  private translations: any = {};

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private locationService: LocationService,
    private organizationService: LookupService,
    private messageService: MessageService,
    private translationService: TranslationService,
    private authService: AuthService
  ) {
    this.locationForm = this.fb.group({
  code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
  name: ['', [Validators.required, Validators.minLength(3)]],
  indexValue: [0, [Validators.required, Validators.min(0)]],
  long: [null, [Validators.pattern(/^[-+]?[0-9]*\.?[0-9]+$/)]],  // number only
  lat: [null, [Validators.pattern(/^[-+]?[0-9]*\.?[0-9]+$/)]],   // number only
  fence: [null],
  parentId: [null],
  organizationId: [null, Validators.required]
});

  }

  ngOnInit(): void {
    this.isSuperAdmin = this.checkIsSuperAdmin();

    console.log("isSuperAdmin ",this. isSuperAdmin)
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.locationForm.patchValue({ organizationId: +orgId });
        this.locationForm.get('organizationId')?.disable();
      }
    }

    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });

    this.loadOrganizations();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.locationId = +params['id'];
        this.loadLocation(this.locationId);
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
          this.organizations = response.data || [];
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
          detail: this.translations.locationForm?.toasts?.orgLoadError || 'Failed to load organizations'
        });
      }
    });
  }

  loadLocation(id: number): void {
    this.loading = true;
    this.locationService.getLocationById(id).subscribe({
      next: (response: ApiResponse<Location>) => {
        if (response.succeeded && response.data) {
          this.locationForm.patchValue({
            code: response.data.code,
            name: response.data.name,
            indexValue: response.data.indexValue,
            long: response.data.long,
            lat: response.data.lat,
            fence: response.data.fence,
            parentId: response.data.parentId,
            organizationId: response.data.organizationId
          });
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
          detail: this.translations.locationForm?.toasts?.loadError || 'Failed to load location data'
        });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.locationForm.invalid) {
      this.markFormGroupTouched(this.locationForm);
      return;
    }

    this.loading = true;
    const formData = { ...this.locationForm.getRawValue() }; // includes disabled values

    if (this.isEditMode && this.locationId) {
      const editData: EditLocation = { id: this.locationId, ...formData };
      this.saveLocation('update', editData);
    } else {
      const createData: CreateLocation = { ...formData };
      this.saveLocation('create', createData);
    }
  }

  private saveLocation(action: 'create' | 'update', data: CreateLocation | EditLocation): void {
    const request$ =
      action === 'create'
        ? this.locationService.createLocation(data as CreateLocation)
        : this.locationService.updateLocation(data as EditLocation);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.translations.common?.success || 'Success',
          detail:
            action === 'create'
              ? this.translations.locationForm?.toasts?.createSuccess || 'Location created successfully'
              : this.translations.locationForm?.toasts?.updateSuccess || 'Location updated successfully'
        });
        this.router.navigate(['/locations']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
          detail:
            action === 'create'
              ? this.translations.locationForm?.toasts?.createError || 'Failed to create location'
              : this.translations.locationForm?.toasts?.updateError || 'Failed to update location'
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
    this.router.navigate(['/locations']);
  }
  
}
