import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Family, CreateFamily, EditFamily } from '../../../interfaces/family.interface';
import { FamilyService } from '../FamilyService';
import { Organization } from '../../../interfaces/organization.interface';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-family-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ButtonModule
  ],
  providers: [MessageService],
  templateUrl: './family-modal.component.html'
})
export class FamilyModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() family: Family | null = null;
  @Input() organizations: Organization[] = [];
  @Input() isSuperAdmin: boolean = false;
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<Family>();
  @Output() onCancelEvent = new EventEmitter<void>();

  familyForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private familyService: FamilyService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.familyForm = this.createForm();
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dialogVisible'] && this.dialogVisible && this.isEditMode && this.family) {
      this.patchForm(this.family);
    } else if (changes['dialogVisible'] && this.dialogVisible && !this.isEditMode) {
      this.resetFormForCreate();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      code: ['', Validators.required],
      name: ['', Validators.required],
      nameSE: ['', Validators.required],
      organizationId: [null, Validators.required]
    });
  }

  patchForm(family: Family): void {
    this.familyForm.patchValue({
      id: family.id,
      code: family.code,
      name: family.name,
      nameSE: family.nameSE,
      organizationId: family.organizationId
    });
  }

  resetFormForCreate(): void {
    this.familyForm.reset();
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.familyForm.patchValue({ organizationId: +orgId });
        this.familyForm.get('organizationId')?.disable();
      }
    } else {
      this.familyForm.get('organizationId')?.enable();
    }
  }

  onSubmit(): void {
    if (this.familyForm.invalid) {
      this.markFormGroupTouched(this.familyForm);
      return;
    }

    this.loading = true;
    const formData = this.familyForm.getRawValue(); 

    if (this.isEditMode) {
      const editData: EditFamily = {
        id: formData.id,
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        organizationId: formData.organizationId
      };
      this.updateFamily(editData);
    } else {
      const createData: CreateFamily = {
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        organizationId: formData.organizationId
      };
      this.createFamily(createData);
    }
  }

  createFamily(data: CreateFamily): void {
    this.familyService.createFamily(data).subscribe({
      next: (response: ApiResponse<Family>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Family created successfully'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create family'
        });
        this.loading = false;
      }
    });
  }

  updateFamily(data: EditFamily): void {
    this.familyService.updateFamily(data).subscribe({
      next: (response: ApiResponse<Family>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Family updated successfully'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update family'
        });
        this.loading = false;
      }
    });
  }

  closeDialog(): void {
    this.dialogVisibleChange.emit(false);
    this.familyForm.get('organizationId')?.enable();
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

