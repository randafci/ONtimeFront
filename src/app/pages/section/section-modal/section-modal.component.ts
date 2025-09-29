import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Section, CreateSection, EditSection } from '../../../interfaces/section.interface';
import { SectionService } from '../SectionService';
import { SectionTypeService } from '../SectionTypeService';
import { SectionType } from '../../../interfaces/section-type.interface';
import { Organization } from '../../../interfaces/organization.interface';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-section-modal',
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
  templateUrl: './section-modal.component.html'
})
export class SectionModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() section: Section | null = null;
  @Input() organizations: Organization[] = [];
  @Input() sectionTypes: SectionType[] = [];
  @Input() sections: Section[] = [];
  @Input() isSuperAdmin: boolean = false;
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<Section>();
  @Output() onCancelEvent = new EventEmitter<void>();

  sectionForm: FormGroup;
  mainSections: Section[] = [];

  constructor(
    private fb: FormBuilder,
    private sectionService: SectionService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.sectionForm = this.createForm();
  }

  ngOnInit(): void {
    // Initialize form
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sections']) {
      this.updateMainSections();
    }
    
    if (changes['dialogVisible'] && this.dialogVisible) {

      this.loading = false;
      
      if (this.isEditMode && this.section) {
        this.patchForm(this.section);
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
      nameSE: ['', Validators.required],
      parentId: [null],
      organizationId: [null, Validators.required],
      sectionTypeLookupId: [null, Validators.required]
    });
  }

  patchForm(section: Section): void {
    this.sectionForm.patchValue({
      id: section.id,
      code: section.code,
      name: section.name,
      nameSE: section.nameSE,
      parentId: section.parentId,
      organizationId: section.organizationId,
      sectionTypeLookupId: section.sectionTypeLookupId
    });
    this.onSectionTypeChange(section.sectionTypeLookupId || 0);
  }

  resetFormForCreate(): void {
    this.sectionForm.reset();
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.sectionForm.patchValue({ organizationId: +orgId });
        this.sectionForm.get('organizationId')?.disable();
      }
    } else {
      this.sectionForm.get('organizationId')?.enable();
    }
  }

  updateMainSections(): void {
    
    this.mainSections = this.sections.filter(section => section.sectionTypeLookupId === 1);
  }

  onSectionTypeChange(sectionTypeLookupId: number): void {
    if (sectionTypeLookupId === 1) {
   
      this.sectionForm.get('parentId')?.setValue(null);
      this.sectionForm.get('parentId')?.disable();
    } else if (sectionTypeLookupId === 2) {

      this.sectionForm.get('parentId')?.enable();
    }
  }

  onSubmit(): void {
    if (this.sectionForm.invalid) {
      this.markFormGroupTouched(this.sectionForm);
      return;
    }

    this.loading = true;
    const formData = this.sectionForm.getRawValue(); // Use getRawValue to include disabled fields

    if (this.isEditMode) {
      const editData: EditSection = { ...formData };
      this.updateSection(editData);
    } else {
      const createData: CreateSection = formData;
      this.createSection(createData);
    }
  }

  createSection(data: CreateSection): void {
    this.sectionService.createSection(data).subscribe({
      next: (response: ApiResponse<Section>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'sectionForm.toasts.createSuccess'
        });
        this.loading = false;
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'sectionForm.toasts.createError'
        });
        this.loading = false;
      }
    });
  }

  updateSection(data: EditSection): void {
    this.sectionService.updateSection(data).subscribe({
      next: (response: ApiResponse<Section>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'sectionForm.toasts.updateSuccess'
        });
        this.loading = false;
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'sectionForm.toasts.updateError'
        });
        this.loading = false;
      }
    });
  }

  closeDialog(): void {
    this.dialogVisibleChange.emit(false);
    this.sectionForm.get('organizationId')?.enable(); // Re-enable on close
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

