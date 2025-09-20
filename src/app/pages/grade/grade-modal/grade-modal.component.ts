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

@Component({
  selector: 'app-grade-modal',
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

  constructor(
    private fb: FormBuilder,
    private gradeService: GradeService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.gradeForm = this.createForm();
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dialogVisible'] && this.dialogVisible && this.isEditMode && this.grade) {
      this.patchForm(this.grade);
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

  patchForm(grade: Grade): void {
    this.gradeForm.patchValue({
      id: grade.id,
      code: grade.code,
      name: grade.name,
      nameSE: grade.nameSE,
      organizationId: grade.organizationId
    });
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
      const editData: EditGrade = {
        id: formData.id,
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        organizationId: formData.organizationId
      };
      this.updateGrade(editData);
    } else {
      const createData: CreateGrade = {
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        organizationId: formData.organizationId
      };
      this.createGrade(createData);
    }
  }

  createGrade(data: CreateGrade): void {
    this.gradeService.createGrade(data).subscribe({
      next: (response: ApiResponse<Grade>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Grade created successfully'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create grade'
        });
        this.loading = false;
      }
    });
  }

  updateGrade(data: EditGrade): void {
    this.gradeService.updateGrade(data).subscribe({
      next: (response: ApiResponse<Grade>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Grade updated successfully'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update grade'
        });
        this.loading = false;
      }
    });
  }

  closeDialog(): void {
    this.dialogVisibleChange.emit(false);
    this.gradeForm.get('organizationId')?.enable();
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

