import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Location, CreateLocation, EditLocation } from '../../../interfaces/location.interface';
import { LocationService } from '../location.service';
import { Organization } from '../../../interfaces/organization.interface';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { MapPickerComponent } from './map-picker/map-picker.component';

@Component({
  selector: 'app-location-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    TranslatePipe,
    MapPickerComponent
  ],
  providers: [MessageService],
  template: `
    <p-dialog
      [(visible)]="dialogVisible"
      [header]="isEditMode ? 'Edit Location' : 'Add Location'"
      [modal]="true"
      [style]="{width: '50vw'}"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onCancel()">
      <form [formGroup]="locationForm" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <!-- Code Field -->
          <div class="field">
            <label for="code" class="block text-sm font-medium mb-2">
              Code <span class="text-red-500">*</span>
            </label>
            <input
              id="code"
              type="text"
              pInputText
              class="w-full"
              formControlName="code"
              [class.ng-invalid]="locationForm.get('code')?.invalid && locationForm.get('code')?.touched"/>
            <small class="text-red-500" *ngIf="locationForm.get('code')?.invalid && locationForm.get('code')?.touched">
              {{ 'common.validation.required' | translate }}
            </small>
          </div>

          <!-- Name Field -->
          <div class="field">
            <label for="name" class="block text-sm font-medium mb-2">
              Name <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              pInputText
              class="w-full"
              formControlName="name"
              [class.ng-invalid]="locationForm.get('name')?.invalid && locationForm.get('name')?.touched"/>
            <small class="text-red-500" *ngIf="locationForm.get('name')?.invalid && locationForm.get('name')?.touched">
              {{ 'common.validation.required' | translate }}
            </small>
          </div>


          <!-- Index Value Field -->
          <div class="field">
            <label for="indexValue" class="block text-sm font-medium mb-2">
              Index Value <span class="text-red-500">*</span>
            </label>
            <input
              id="indexValue"
              type="number"
              pInputText
              class="w-full"
              formControlName="indexValue"
              [class.ng-invalid]="locationForm.get('indexValue')?.invalid && locationForm.get('indexValue')?.touched"/>
            <small class="text-red-500" *ngIf="locationForm.get('indexValue')?.invalid && locationForm.get('indexValue')?.touched">
              {{ 'common.validation.required' | translate }}
            </small>
          </div>

          <!-- Map Picker -->
          <div class="field col-span-2">
            <app-map-picker
              [selectedLat]="locationForm.get('lat')?.value"
              [selectedLng]="locationForm.get('long')?.value"
              (coordinatesChanged)="onMapCoordinatesChanged($event)">
            </app-map-picker>
          </div>

          <!-- Fence Field -->
          <div class="field">
            <label for="fence" class="block text-sm font-medium mb-2">
              Fence
            </label>
            <input
              id="fence"
              type="text"
              pInputText
              class="w-full"
              formControlName="fence"
              [class.ng-invalid]="locationForm.get('fence')?.invalid && locationForm.get('fence')?.touched"/>
            <small class="text-red-500" *ngIf="locationForm.get('fence')?.invalid && locationForm.get('fence')?.touched">
              Please enter a valid number (e.g., 100 or 100.5)
            </small>
          </div>

          <!-- Parent Location Field -->
          <div class="field">
            <label for="parentId" class="block text-sm font-medium mb-2">
              Parent Location
            </label>
            <p-select
              id="parentId"
              class="w-full"
              formControlName="parentId"
              [options]="parentLocations"
              optionLabel="name"
              optionValue="id"
              placeholder="Select Parent Location"
              appendTo="body">
            </p-select>
          </div>

          <!-- Organization Field -->
          <div class="field" *ngIf="isSuperAdmin">
            <label for="organizationId" class="block text-sm font-medium mb-2">
              Organization <span class="text-red-500">*</span>
            </label>
            <p-select
              id="organizationId"
              class="w-full"
              formControlName="organizationId"
              [options]="organizations"
              optionLabel="name"
              optionValue="id"
              placeholder="Select Organization"
              appendTo="body"
              [class.ng-invalid]="locationForm.get('organizationId')?.invalid && locationForm.get('organizationId')?.touched">
            </p-select>
            <small class="text-red-500" *ngIf="locationForm.get('organizationId')?.invalid && locationForm.get('organizationId')?.touched">
              {{ 'common.validation.required' | translate }}
            </small>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            pButton
            label="Cancel"
            class="p-button-secondary"
            type="button"
            (click)="onCancel()">
          </button>
          <button
            pButton
            [label]="isEditMode ? 'Update' : 'Save'"
            [loading]="loading"
            type="submit">
          </button>
        </div>
      </form>
    </p-dialog>
  `
})
export class LocationModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() location: Location | null = null;
  @Input() organizations: Organization[] = [];
  @Input() parentLocations: Location[] = [];
  @Input() isSuperAdmin: boolean = false;
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<Location>();
  @Output() onCancelEvent = new EventEmitter<void>();

  locationForm: FormGroup;
  private translations: any = {};

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private messageService: MessageService,
    private authService: AuthService,
    private translationService: TranslationService
  ) {
    this.locationForm = this.createForm();
  }

  ngOnInit(): void {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dialogVisible'] && this.dialogVisible) {
      this.loading = false;
      
      if (this.isEditMode && this.location) {
        this.patchForm(this.location);
      } else if (!this.isEditMode) {
        this.resetFormForCreate();
      }
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      code: ['', Validators.required],
      name: ['', Validators.required],
      indexValue: [0, [Validators.required, Validators.min(0)]],
      long: [null, [Validators.pattern(/^[-+]?[0-9]*\.?[0-9]+$/)]],
      lat: [null, [Validators.pattern(/^[-+]?[0-9]*\.?[0-9]+$/)]],
      fence: [null, [Validators.pattern(/^[0-9]*\.?[0-9]+$/)]],
      parentId: [null],
      organizationId: [null, Validators.required]
    });
  }

  patchForm(location: Location): void {
    this.locationForm.patchValue({
      id: location.id,
      code: location.code,
      name: location.name,
      indexValue: location.indexValue,
      long: location.long,
      lat: location.lat,
      fence: location.fence,
      parentId: location.parentId,
      organizationId: location.organizationId
    });
  }

  resetFormForCreate(): void {
    this.locationForm.reset();
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.locationForm.patchValue({ organizationId: +orgId });
        this.locationForm.get('organizationId')?.disable();
      }
    } else {
      this.locationForm.get('organizationId')?.enable();
    }
  }

  onSubmit(): void {
    if (this.locationForm.invalid) {
      this.markFormGroupTouched(this.locationForm);
      return;
    }

    this.loading = true;
    const formData = this.locationForm.getRawValue();

    if (this.isEditMode) {
      const editData: EditLocation = {
        id: formData.id,
        code: formData.code,
        name: formData.name,
        indexValue: formData.indexValue,
        long: formData.long,
        lat: formData.lat,
        fence: formData.fence,
        parentId: formData.parentId,
        organizationId: formData.organizationId
      };
      this.updateLocation(editData);
    } else {
      const createData: CreateLocation = {
        code: formData.code,
        name: formData.name,
        indexValue: formData.indexValue,
        long: formData.long,
        lat: formData.lat,
        fence: formData.fence,
        parentId: formData.parentId,
        organizationId: formData.organizationId
      };
      this.createLocation(createData);
    }
  }

  createLocation(data: CreateLocation): void {
    this.locationService.createLocation(data).subscribe({
      next: (response: ApiResponse<Location>) => {
        const completeLocation: Location = {
          ...data,
          ...response.data,
          id: response.data?.id || 0
        };
        this.handleSuccess(this.translations.locationForm?.toasts?.createSuccess || 'Location created successfully', completeLocation);
      },
      error: (error: any) => {
        this.handleError(this.translations.locationForm?.toasts?.createError || 'Failed to create location');
      }
    });
  }

  updateLocation(data: EditLocation): void {
    this.locationService.updateLocation(data).subscribe({
      next: (response: ApiResponse<Location>) => {
        const completeLocation: Location = {
          ...data,
          ...response.data
        };
        this.handleSuccess(this.translations.locationForm?.toasts?.updateSuccess || 'Location updated successfully', completeLocation);
      },
      error: (error: any) => {
        this.handleError(this.translations.locationForm?.toasts?.updateError || 'Failed to update location');
      }
    });
  }

  private handleSuccess(detail: string, data: Location): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translations.common?.success || 'Success',
      detail: detail
    });
    this.loading = false;
    this.onSave.emit(data);
    this.closeDialog();
  }

  private handleError(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translations.common?.error || 'Error',
      detail: detail
    });
    this.loading = false;
  }

  closeDialog(): void {
    this.dialogVisibleChange.emit(false);
    this.locationForm.get('organizationId')?.enable();
  }

  onCancel(): void {
    this.closeDialog();
    this.onCancelEvent.emit();
  }

  onMapCoordinatesChanged(coordinates: { lat: number; lng: number }): void {
    this.locationForm.patchValue({
      lat: coordinates.lat,
      long: coordinates.lng
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
}
