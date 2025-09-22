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
import { Department } from '@/interfaces/department.interface';
import { DepartmentService } from '../DepartmentService';
import { LookupService } from '../../organization/OrganizationService';
import { CompanyService } from '../../company/CompanyService';
import { Organization } from '@/interfaces/organization.interface';
import { Company } from '@/interfaces/company.interface';
import { Router, RouterModule } from "@angular/router";
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { TranslationService } from '@/pages/translation-manager/translation-manager/translation.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { AuthService } from '@/auth/auth.service';
import { DepartmentModalComponent } from '../department-modal/department-modal.component';


@Component({
  selector: 'app-department-list',
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
    DatePipe,
    TranslatePipe,
    DepartmentModalComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './department-list.html',
  styleUrl: './department-list.scss'
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  loading: boolean = true;

  // Dialog properties
  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  selectedDepartment: Department | null = null;
  organizations: Organization[] = [];
  companies: Company[] = [];
  isSuperAdmin = false;

  statuses: any[] = []; // Will be populated from translations
  integrationOptions: any[] = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];

  activityValues: number[] = [0, 100];

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  // Store the current translations
  private translations: any = {};

  constructor(
    private departmentService: DepartmentService,
    private organizationService: LookupService,
    private companyService: CompanyService,
    private messageService: MessageService,
    private router: Router,
    private translationService: TranslationService,
    private confirmationService: ConfirmationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isSuperAdmin = this.checkIsSuperAdmin();

    // Subscribe to translation changes to build dynamic arrays
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
      this.statuses = [
        { label: translations.departmentList?.statusValues?.active || 'Active', value: 'active' },
        { label: translations.departmentList?.statusValues?.inactive || 'Inactive', value: 'inactive' }
      ];
    });

    this.loadDepartments();
    this.loadOrganizations();
    this.loadCompanies();
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

  loadCompanies(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (response: ApiResponse<Company[]>) => {
        if (response.succeeded) {
          this.companies = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading companies:', error);
      }
    });
  }

  loadDepartments() {
    this.loading = true;
    this.departmentService.getAllDepartments().subscribe({
      next: (response: ApiResponse<Department[]>) => {
        if (response.succeeded) {
          this.departments = response.data||[];
        } else {
          this.messageService.add({
            severity: 'error',

            summary: this.translations.common?.error || 'Error',
            detail: response.message || this.translations.departmentList?.messages?.loadError
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.messageService.add({
          severity: 'error',

          summary: this.translations.common?.error || 'Error',
          detail: this.translations.departmentList?.messages?.loadError
        });
        this.loading = false;
      }
    });
  }

  getStatus(department: Department): string {
    return department.isDeleted ? 'inactive' : 'active';
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
    this.selectedDepartment = null;
    this.dialogVisible = true;
  }

  openEditDialog(department: Department) {
    this.isEditMode = true;
    this.selectedDepartment = department;
    this.dialogVisible = true;
  }

  onDepartmentSaved(department: Department) {
    this.loadDepartments();
  }

  onDepartmentModalCancel() {
    // Handle modal cancellation if needed
  }

  deleteDepartment(department: Department) {
    const message = (this.translations.departmentList?.messages?.deleteConfirm || 'Are you sure you want to delete {name}?')
                    .replace('{name}', department.name);

    this.confirmationService.confirm({
      message: message,
      header: this.translations.departmentList?.messages?.deleteHeader || 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.departmentService.deleteDepartment(department.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Department ${department.name} deleted successfully`
              });
              this.loadDepartments();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || 'Failed to delete department'
              });
            }
          },
          error: (error) => {
            console.error('Error deleting department:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete department'
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
