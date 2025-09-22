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
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CostCenter } from '../../../interfaces/cost-center.interface';
import { CostCenterService } from '../CostCenterService';
import { LookupService } from '../../organization/OrganizationService';
import { Organization } from '../../../interfaces/organization.interface';
import { Router, RouterModule } from "@angular/router";
import { ApiResponse } from '../../../core/models/api-response.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { AuthService } from '../../../auth/auth.service';
import { CostCenterModalComponent } from '../cost-center-modal/cost-center-modal.component';

@Component({
  selector: 'app-cost-center-list',
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
    TooltipModule,
    RouterModule,
    TranslatePipe,
    CostCenterModalComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './cost-center-list.html'
})
export class CostCenterListComponent implements OnInit {
  costCenters: CostCenter[] = [];
  loading: boolean = true;

  // Dialog properties
  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  selectedCostCenter: CostCenter | null = null;
  organizations: Organization[] = [];
  isSuperAdmin = false;

  integrationOptions: any[] = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];

  activityValues: number[] = [0, 100];

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private costCenterService: CostCenterService,
    private organizationService: LookupService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isSuperAdmin = this.checkIsSuperAdmin();
    this.loadCostCenters();
    this.loadOrganizations();
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

  loadCostCenters() {
    this.loading = true;
    this.costCenterService.getAllCostCenters().subscribe({
      next: (response: ApiResponse<CostCenter[]>) => {
        if (response.succeeded) {
          this.costCenters = response.data;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load cost centers'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cost centers:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load cost centers'
        });
        this.loading = false;
      }
    });
  }

  


  getIntegrationSeverity(fromIntegration: boolean) {
    return fromIntegration ? 'warning' : 'info';
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.selectedCostCenter = null;
    this.dialogVisible = true;
  }

  openEditDialog(costCenter: CostCenter) {
    this.isEditMode = true;
    this.selectedCostCenter = costCenter;
    this.dialogVisible = true;
  }

  onCostCenterSaved(costCenter: CostCenter) {
    this.loadCostCenters();
  }

  onCostCenterModalCancel() {
    // Handle modal cancellation if needed
  }

  deleteCostCenter(costCenter: CostCenter) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${costCenter.name}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.costCenterService.deleteCostCenter(costCenter.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Cost Center ${costCenter.name} deleted successfully`
              });
              this.loadCostCenters();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || 'Failed to delete cost center'
              });
            }
          },
          error: (error) => {
            console.error('Error deleting cost center:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete cost center'
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
