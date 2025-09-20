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
import { MessageService } from 'primeng/api';
import { Company } from '../../../interfaces/company.interface';
import { CompanyService } from '../CompanyService';
import { CompanyTypeService } from '../CompanyTypeService';
import { LookupService } from '../../organization/OrganizationService';
import { CompanyType } from '../../../interfaces/company-type.interface';
import { Organization } from '../../../interfaces/organization.interface';
import { Router, RouterModule } from "@angular/router";
import { DatePipe } from '@angular/common';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { AuthService } from '../../../auth/auth.service';
import { CompanyModalComponent } from '../../company/company-modal/company-modal.component';

@Component({
  selector: 'app-company-list',
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
    RouterModule,
    DatePipe,
    TranslatePipe,
    CompanyModalComponent
  ],
  providers: [MessageService],
  templateUrl: './company-list.html',
  styleUrl: './company-list.scss'
})
export class CompanyListComponent implements OnInit {
  companies: Company[] = [];
  loading: boolean = true;
  statuses: any[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  integrationOptions: any[] = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];

  activityValues: number[] = [0, 100];

  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  selectedCompany: Company | null = null;
  organizations: Organization[] = [];
  companyTypes: CompanyType[] = [];
  isSuperAdmin = false;

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private companyService: CompanyService,
    private companyTypeService: CompanyTypeService,
    private organizationService: LookupService,
    private messageService: MessageService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isSuperAdmin = this.checkIsSuperAdmin();
    this.loadCompanies();
    this.loadOrganizations();
    this.loadCompanyTypes();
  }


  private checkIsSuperAdmin(): boolean {
    const claims = this.authService.getClaims();
    return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
  }

  loadCompanies() {
    this.loading = true;
    this.companyService.getAllCompanies().subscribe({
      next: (response: ApiResponse<Company[]>) => {
        if (response.succeeded) {
          this.companies = response.data;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load companies'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading companies:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load companies'
        });
        this.loading = false;
      }
    });
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

  loadCompanyTypes(): void {
    this.companyTypeService.getAllCompanyTypes().subscribe({
      next: (response: ApiResponse<CompanyType[]>) => {
        if (response.succeeded) {
          this.companyTypes = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading company types:', error);
      }
    });
  }


  getStatus(company: Company): string {
    return company.isDeleted ? 'inactive' : 'active';
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
    this.selectedCompany = null;
    this.dialogVisible = true;
  }

  openEditDialog(company: Company) {
    this.isEditMode = true;
    this.selectedCompany = company;
    this.dialogVisible = true;
  }

  onCompanySaved(company: Company) {
    this.loadCompanies();
  }



  deleteCompany(company: Company) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Delete',
      detail: `Are you sure you want to delete ${company.name}?`,
      life: 3000
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
