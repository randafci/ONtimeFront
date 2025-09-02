// organization-list.component.ts
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
import { ConfirmationService, MessageService } from 'primeng/api';
import { Organization } from '../../../interfaces/organization.interface';
import { LookupService } from '../OrganizationService';
import { Router, RouterModule } from "@angular/router";
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';

@Component({
  selector: 'app-organization-list',
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
    TranslatePipe

  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './organization-list.html',
  styleUrl: './organization-list.scss'
})
export class OrganizationListComponent implements OnInit {
  organizations: Organization[] = [];
  loading: boolean = true;
  // statuses: any[] = [
  //   { label: 'Active', value: 'active' },
  //   { label: 'Inactive', value: 'inactive' }
  // ];
  statuses: any[] = [];
  private translations: any = {};

  activityValues: number[] = [0, 100];

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private lookupService: LookupService,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService, 
    private translationService: TranslationService  
  ) {}

  ngOnInit() {
    this.translationService.translations$.subscribe(trans => {
      this.translations = trans;
      this.initializeStatuses(); 
    });
    this.loadOrganizations();
  }

  initializeStatuses(): void {
    const statusTrans = this.translations.organizations?.listPage?.statusValues;
    this.statuses = [
      { label: statusTrans?.active || 'Active', value: 'active' },
      { label: statusTrans?.inactive || 'Inactive', value: 'inactive' }
    ];
  }


  loadOrganizations() {
    this.loading = true;
    this.lookupService.getAllOrganizations().subscribe({
      next: (response: ApiResponse<Organization[]>) => {
        if (response.succeeded) {
          this.organizations = response.data||[];
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load organizations'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load organizations'
        });
        this.loading = false;
      }
    });
  }

  getStatus(organization: Organization): string {
    return organization.isDeleted ? 'inactive' : 'active';
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

  navigateToAdd() {
    this.router.navigate(['/organizations/add']);
  }

  navigateToEdit(id: number) {
    this.router.navigate(['/organizations/edit', id]);
  }

  deleteOrganization(organization: Organization) {
    const trans = this.translations.organizations?.listPage;
    const commonTrans = this.translations.common;

    this.confirmationService.confirm({
      message: (trans?.deleteConfirm || 'Are you sure you want to delete {name}?').replace('{name}', organization.name),
      header: commonTrans?.confirmDelete || 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        
        console.log('Deleting organization:', organization);
        this.messageService.add({
          severity: 'success',
          summary: commonTrans?.success || 'Success',
          detail: trans?.deleteSuccess || 'Organization deleted successfully'
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