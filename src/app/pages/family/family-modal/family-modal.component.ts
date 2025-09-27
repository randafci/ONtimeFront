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
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-family-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    TranslatePipe
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
  private translations: any = {};

  constructor(
    private fb: FormBuilder,
    private familyService: FamilyService,
    private messageService: MessageService,
    private authService: AuthService,
    private translationService: TranslationService
  ) {
    this.familyForm = this.createForm();
  }

  ngOnInit(): void {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dialogVisible'] && this.dialogVisible) {
      if (this.isEditMode && this.family) {
        this.patchForm(this.family);
      } else {
        this.resetFormForCreate();
      }
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
    this.familyForm.patchValue(family);
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
      this.updateFamily(formData as EditFamily);
    } else {
      this.createFamily(formData as CreateFamily);
    }
  }

  createFamily(data: CreateFamily): void {
    this.familyService.createFamily(data).subscribe({
      next: (response: ApiResponse<Family>) => {
        this.handleSuccess(this.translations.familyForm?.toasts?.createSuccess, response.data);
      },
      error: (error) => {
        this.handleError(this.translations.familyForm?.toasts?.createError);
      }
    });
  }

  updateFamily(data: EditFamily): void {
    this.familyService.updateFamily(data).subscribe({
      next: (response: ApiResponse<Family>) => {
        this.handleSuccess(this.translations.familyForm?.toasts?.updateSuccess, response.data);
      },
      error: (error) => {
        this.handleError(this.translations.familyForm?.toasts?.updateError);
      }
    });
  }

  private handleSuccess(detailKey: string, data: Family): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translations.common?.success || 'Success',
      detail: detailKey || 'Operation successful'
    });
    this.onSave.emit(data);
    this.closeDialog();
  }

  private handleError(detailKey: string): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translations.common?.error || 'Error',
      detail: detailKey || 'An error occurred'
    });
    this.loading = false;
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

