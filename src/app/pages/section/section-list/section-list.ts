import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { ConfirmationService, MessageService } from 'primeng/api';
import { Section } from '@/interfaces/section.interface';
import { SectionService } from '../SectionService';
import { SectionTypeService } from '../SectionTypeService';
import { LookupService } from '../../organization/OrganizationService';
import { Organization } from '@/interfaces/organization.interface';
import { SectionType } from '@/interfaces/section-type.interface';
import { Router, RouterModule } from "@angular/router";
import { DatePipe } from '@angular/common';
import { ApiResponse } from '@/core/models/api-response.model';
import { AuthService } from '@/auth/auth.service';
import { SectionModalComponent } from '../section-modal/section-modal.component';


@Component({
  selector: 'app-section-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    MultiSelectModule,
    InputTextModule,
    SliderModule,
    ProgressBarModule,
    TagModule,
    ButtonModule,
    InputIconModule,
    IconFieldModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    RouterModule,
    SectionModalComponent,
    DatePipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './section-list.html',
  styleUrl: './section-list.scss'
})
export class SectionListComponent implements OnInit {
  sections: Section[] = [];
  loading: boolean = true;

  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  selectedSection: Section | null = null;
  organizations: Organization[] = [];
  sectionTypes: SectionType[] = [];
  isSuperAdmin = false;

  statuses: any[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  integrationOptions: any[] = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];

  activityValues: number[] = [0, 100];

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private sectionService: SectionService,
    private sectionTypeService: SectionTypeService,
    private organizationService: LookupService,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isSuperAdmin = this.checkIsSuperAdmin();
    this.loadSections();
    this.loadOrganizations();
    this.loadSectionTypes();
  }


  private checkIsSuperAdmin(): boolean {
    const claims = this.authService.getClaims();
    return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
  }

  loadOrganizations(): void {
    this.organizationService.getAllOrganizations().subscribe({
      next: (response: ApiResponse<Organization[]>) => {
        if (response.succeeded) {
          this.organizations = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
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

  loadSections() {
    this.loading = true;
    this.sectionService.getAllSections().subscribe({
      next: (response: ApiResponse<Section[]>) => {
        if (response.succeeded) {
          this.sections = response.data||[];
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load sections'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading sections:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load sections'
        });
        this.loading = false;
      }
    });
  }

  getStatus(section: Section): string {
    return section.isDeleted ? 'inactive' : 'active';
  }

  getSeverity(status: string) {
    if (!status) return 'info';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'danger';
      default:
        return 'info';
    }
  }

  getIntegrationSeverity(fromIntegration: boolean) {
    return fromIntegration ? 'warning' : 'info';
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.selectedSection = null;
    this.dialogVisible = true;
  }

  openEditDialog(section: Section) {
    this.isEditMode = true;
    this.selectedSection = section;
    this.dialogVisible = true;
  }

  onSectionSaved(section: Section): void {
    this.loadSections();
  }

  deleteSection(section: Section) {
    const message = `Are you sure you want to delete ${section.name}?`;

    this.confirmationService.confirm({
      message: message,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.sectionService.deleteSection(section.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Section ${section.name} deleted successfully`
              });
              this.loadSections();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || 'Failed to delete section'
              });
            }
          },
          error: (error) => {
            console.error('Error deleting section:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete section'
            });
          }
        });
      }
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }
}
