import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { SectionService } from '../SectionService';
import { SectionTypeService } from '../SectionTypeService';
import { LookupService } from '../../organization/OrganizationService';
import { Section, CreateSection, EditSection } from '@/interfaces/section.interface';
import { SectionType } from '@/interfaces/section-type.interface';
import { Organization } from '@/interfaces/organization.interface';
import { CommonModule } from '@angular/common';
import { ApiResponse } from '@/core/models/api-response.model';

@Component({
  selector: 'app-add-or-edit-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToastModule
  ],
  templateUrl: './add-or-edit-section.html',
  styleUrl: './add-or-edit-section.scss',
  providers: [MessageService]
})
export class AddOrEditSection implements OnInit {
  sectionForm: FormGroup;
  isEditMode = false;
  sectionId: number | null = null;
  loading = false;
  submitted = false;
  organizations: Organization[] = [];
  sections: Section[] = [];
  sectionTypes: SectionType[] = [];
  mainSections: Section[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private sectionService: SectionService,
    private sectionTypeService: SectionTypeService,
    private organizationService: LookupService,
    private messageService: MessageService
  ) {
    this.sectionForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      nameSE: ['', Validators.required],
      parentId: [null],
      organizationId: [null, Validators.required],
      sectionTypeLookupId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadOrganizations();
    this.loadSections();
    this.loadSectionTypes();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.sectionId = +params['id'];
        this.loadSection(this.sectionId);
      }
    });

    // Watch for section type changes
    this.sectionForm.get('sectionTypeLookupId')?.valueChanges.subscribe(sectionTypeId => {
      this.onSectionTypeChange(sectionTypeId);
    });
  }

  loadOrganizations(): void {
    this.organizationService.getAllOrganizations().subscribe({
      next: (response: ApiResponse<Organization[]>) => {
        if (response.succeeded) {
          this.organizations = response.data||[];
        }
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
      }
    });
  }

  loadSections(): void {
    this.sectionService.getAllSections().subscribe({
      next: (response: ApiResponse<Section[]>) => {
        if (response.succeeded) {
          this.sections = response.data||[];
          this.updateMainSections();
        }
      },
      error: (error) => {
        console.error('Error loading sections:', error);
      }
    });
  }

  loadSectionTypes(): void {
    this.sectionTypeService.getAllSectionTypes().subscribe({
      next: (response: ApiResponse<SectionType[]>) => {
        if (response.succeeded) {
          this.sectionTypes = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading section types:', error);
      }
    });
  }

  updateMainSections(): void {
    // Filter sections to show only Main Sections (sectionTypeLookupId = 1)
    this.mainSections = this.sections.filter(section => section.sectionTypeLookupId === 1);
  }

  onSectionTypeChange(sectionTypeId: number): void {
    if (sectionTypeId === 1) { // Main Section
      // Hide parent section selection
      this.sectionForm.get('parentId')?.setValue(null);
      this.sectionForm.get('parentId')?.disable();
    } else if (sectionTypeId === 2) { // Sub Section
      // Show parent section selection with only main sections
      this.sectionForm.get('parentId')?.enable();
    }
  }

  loadSection(id: number): void {
    this.loading = true;
    this.sectionService.getSectionById(id).subscribe({
      next: (response: ApiResponse<Section>) => {
        if (response.succeeded && response.data) {
          this.sectionForm.patchValue({
            code: response.data.code,
            name: response.data.name,
            nameSE: response.data.nameSE,
            parentId: response.data.parentId,
            organizationId: response.data.organizationId,
            sectionTypeLookupId: response.data.sectionTypeLookupId
          });
          this.onSectionTypeChange(response.data.sectionTypeLookupId || 0);
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load section data'
        });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.sectionForm.invalid) {
      this.markFormGroupTouched(this.sectionForm);
      return;
    }

    this.loading = true;
    const formData = this.sectionForm.value;

    if (this.isEditMode && this.sectionId) {
      const editData: EditSection = {
        id: this.sectionId,
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        parentId: formData.parentId,
        organizationId: formData.organizationId,
        sectionTypeLookupId: formData.sectionTypeLookupId
      };
      this.updateSection(editData);
    } else {
      const createData: CreateSection = {
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        parentId: formData.parentId,
        organizationId: formData.organizationId,
        sectionTypeLookupId: formData.sectionTypeLookupId
      };
      this.createSection(createData);
    }
  }

  createSection(data: CreateSection): void {
    this.sectionService.createSection(data).subscribe({
      next: (response: ApiResponse<Section>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Section created successfully'
        });
        this.router.navigate(['/sections']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create section'
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
          detail: 'Section updated successfully'
        });
        this.router.navigate(['/sections']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update section'
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
    this.router.navigate(['/sections']);
  }
}
