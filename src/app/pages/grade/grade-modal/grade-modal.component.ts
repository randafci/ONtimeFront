import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Grade, CreateGrade, EditGrade } from '../../../interfaces/grade.interface';
import { GradeService } from '../GradeService';
import { Organization } from '../../../interfaces/organization.interface';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-grade-modal',
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
  templateUrl: './grade-modal.component.html'
})
export class GradeModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() grade: Grade | null = null;
  @Input() organizations: Organization[] = [];
  @Input() isSuperAdmin: boolean = false;
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<Grade>();
  @Output() onCancelEvent = new EventEmitter<void>();

  gradeForm: FormGroup;
  private translations: any = {};

  constructor(
    private fb: FormBuilder,
    private gradeService: GradeService,
    private messageService: MessageService,
    private authService: AuthService,
    private translationService: TranslationService
  ) {
    this.gradeForm = this.createForm();
  }

  ngOnInit(): void {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dialogVisible'] && this.dialogVisible) {
      if (this.isEditMode && this.grade) {
        this.patchForm(this.grade);
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

  patchForm(grade: Grade): void {
    this.gradeForm.patchValue(grade);
  }

  resetFormForCreate(): void {
    this.gradeForm.reset();
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.gradeForm.patchValue({ organizationId: +orgId });
        this.gradeForm.get('organizationId')?.disable();
      }
    } else {
      this.gradeForm.get('organizationId')?.enable();
    }
  }

  onSubmit(): void {
    if (this.gradeForm.invalid) {
      this.markFormGroupTouched(this.gradeForm);
      return;
    }

    this.loading = true;
    const formData = this.gradeForm.getRawValue();

    if (this.isEditMode) {
      this.updateGrade(formData as EditGrade);
    } else {
      this.createGrade(formData as CreateGrade);
    }
  }

  createGrade(data: CreateGrade): void {
    this.gradeService.createGrade(data).subscribe({
      next: (response: ApiResponse<Grade>) => {
        this.handleSuccess(this.translations.gradeForm?.toasts?.createSuccess, response.data);
      },
      error: (error) => {
        this.handleError(this.translations.gradeForm?.toasts?.createError);
      }
    });
  }

  updateGrade(data: EditGrade): void {
    this.gradeService.updateGrade(data).subscribe({
      next: (response: ApiResponse<Grade>) => {
        this.handleSuccess(this.translations.gradeForm?.toasts?.updateSuccess, response.data);
      },
      error: (error) => {
        this.handleError(this.translations.gradeForm?.toasts?.updateError);
      }
    });
  }
  
  private handleSuccess(detailKey: string, data: Grade): void {
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

