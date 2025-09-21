import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DeviceService } from '../device.service';
import { DeviceUpdate } from '../device.model';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
// --- ADD THESE TWO LINES ---
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';

import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { LocationService } from '../../location/location.service';
import { LookupService } from '../../organization/OrganizationService';
import { AuthService } from '../../../auth/auth.service';
import { Organization } from '../../../interfaces/organization.interface';
import { ApiResponse } from '../../../core/models/api-response.model';
@Component({
  selector: 'app-add-edit-device',
  templateUrl: './add-edit-device.component.html',
  styleUrls: ['./add-edit-device.component.scss'],
  standalone:true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    RippleModule,
    CheckboxModule,
    ToastModule,
    SelectModule,
    ProgressSpinnerModule,
    TranslatePipe
  ],
  providers: [MessageService]
})
export class AddEditDeviceComponent implements OnInit {
  deviceForm!: FormGroup;
  isSaving = false;
  isEditMode = false;
  private deviceId: number | null = null;
 
  locationsList: any[] = []; 
  organizations: Organization[] = [];
  isSuperAdmin = false;
  submitted = false; 


  constructor(
    private fb: FormBuilder,
    private deviceService: DeviceService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private locationService: LocationService,
    private organizationService: LookupService, 
    private authService: AuthService 
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.deviceId = idParam ? +idParam : null;
    this.isEditMode = !!this.deviceId;
    
    this.initializeForm();
    this.loadLocations();

    this.isSuperAdmin = this.checkIsSuperAdmin();

    if (this.isSuperAdmin) {
      // Super Admin can choose any organization
      this.loadOrganizations();
    } else {
      // Regular user's organization is pre-filled and disabled
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.deviceForm.patchValue({ organizationId: +orgId });
        this.deviceForm.get('organizationId')?.disable();
      }
    }
    this.submitted = false;

    if (this.isEditMode && this.deviceId) {
      this.loadDeviceData(this.deviceId);
    }


    // this.loadLocations();
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
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch organizations.' });
      }
    });
  }
  
  loadLocations(): void {
    this.locationService.getAllLocations().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.locationsList = response.data;
        } else {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Could not load locations.' 
          });
        }
      },
      error: (err) => {
        this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to fetch locations from the server.' 
        });
      }
    });
  }


  initializeForm(): void {
    this.deviceForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(100)]],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      ipAddress: ['', [Validators.required, Validators.maxLength(100)]],
      locationId: [null, Validators.required],
      disabled: [false],
      download: [true],
      organizationId: [null, Validators.required]
    });
  }

  loadDeviceData(id: number): void {
    this.deviceService.getDeviceById(id).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.deviceForm.patchValue(response.data);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load device data.' });
        }
      }
    });
  }

  onSubmit(): void {
    if (this.deviceForm.invalid) {
      this.deviceForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const deviceData = this.deviceForm.getRawValue();

    if (this.isEditMode && this.deviceId) {
      const updatedDevice: DeviceUpdate = { id: this.deviceId, ...deviceData };
      this.deviceService.updateDevice(this.deviceId, updatedDevice).subscribe(this.getObserver('updated'));
    } else {
      this.deviceService.createDevice(deviceData).subscribe(this.getObserver('added'));
    }
  }

  private getObserver(action: 'added' | 'updated') {
    return {
      next: (response: any) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Device ${action} successfully!`
          });
          setTimeout(() => this.router.navigate(['/devices']), 1500);
        } else {
          this.isSaving = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error: (err: any) => {
        this.isSaving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'An error occurred.' });
      }
    };
  }

  get f() {
    return this.deviceForm.controls;
  }
  onCancel(): void {
    this.router.navigate(['/devices']);
  }
}