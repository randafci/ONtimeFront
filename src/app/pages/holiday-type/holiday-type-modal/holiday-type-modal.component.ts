import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { HolidayTypeList } from '../../../interfaces/holiday-type.interface';
import { HolidayTypeService, CreateHolidayType, EditHolidayType } from '../HolidayTypeService';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { Organization } from '../../../interfaces/organization.interface';

@Component({
  selector: 'app-holiday-type-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
  ],
  providers: [MessageService],
  templateUrl: './holiday-type-modal.component.html',
})
export class HolidayTypeModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() holidayType: HolidayTypeList | null = null;
  @Input() organizations: Organization[] = [];
  @Input() isSuperAdmin: boolean = false;
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<HolidayTypeList>();
  @Output() onCancelEvent = new EventEmitter<void>();

  holidayTypeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private holidayTypeService: HolidayTypeService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.holidayTypeForm = this.createForm();
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.dialogVisible && this.holidayType) {
      this.loadHolidayTypeData();
    } else if (this.dialogVisible && !this.isEditMode) {
      this.resetForm();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      nameSE: ['', [Validators.required, Validators.maxLength(100)]],
      organizationId: [null, Validators.required]
    });
  }

  loadHolidayTypeData(): void {
    if (this.holidayType) {
      this.holidayTypeForm.patchValue({
        id: this.holidayType.id,
        code: this.holidayType.code,
        name: this.holidayType.name,
        nameSE: this.holidayType.nameSE,
        organizationId: this.holidayType.organizationId
      });
    }
  }

  resetForm(): void {
    this.holidayTypeForm.reset();
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.holidayTypeForm.patchValue({ organizationId: +orgId });
      }
    }
  }

  onSubmit(): void {
    if (this.holidayTypeForm.invalid) {
      this.markFormGroupTouched(this.holidayTypeForm);
      return;
    }

    const formData = this.holidayTypeForm.value;

    if (this.isEditMode) {
      const editData: EditHolidayType = {
        id: this.holidayTypeForm.get('id')?.value,
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        organizationId: formData.organizationId
      };
      this.updateHolidayType(editData);
    } else {
      const createData: CreateHolidayType = {
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        organizationId: formData.organizationId
      };
      this.createHolidayType(createData);
    }
  }

  createHolidayType(data: CreateHolidayType): void {
    this.holidayTypeService.createHolidayType(data).subscribe({
      next: (response: ApiResponse<HolidayTypeList>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Holiday type created successfully'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create holiday type'
        });
      }
    });
  }

  updateHolidayType(data: EditHolidayType): void {
    this.holidayTypeService.updateHolidayType(data).subscribe({
      next: (response: ApiResponse<HolidayTypeList>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Holiday type updated successfully'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update holiday type'
        });
      }
    });
  }

  onDialogHide(): void {
    this.closeDialog();
  }

  closeDialog(): void {
    this.dialogVisibleChange.emit(false);
  }

  onCancel(): void {
    this.closeDialog();
    this.onCancelEvent.emit();
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
