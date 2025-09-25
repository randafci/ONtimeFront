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
<<<<<<< HEAD
import { ConfirmationService, MessageService } from 'primeng/api';
=======
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
>>>>>>> a0691417d48c81e0e0fc2d91a35228f2120c4cfc
import { Designation } from '../../../interfaces/designation.interface';
import { DesignationService } from '../DesignationService';
import { DesignationTypeService } from '../DesignationTypeService';
import { LookupService } from '../../organization/OrganizationService';
import { DesignationType } from '../../../interfaces/designation-type.interface';
import { Organization } from '../../../interfaces/organization.interface';
import { Router, RouterModule } from "@angular/router";
import { DatePipe } from '@angular/common';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { DesignationModalComponent } from '../designation-modal/designation-modal.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-designation-list',
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
    DesignationModalComponent,
    TranslatePipe
  ],
  providers: [MessageService, TranslatePipe, ConfirmationService],
  templateUrl: './designation-list.html',
  styleUrl: './designation-list.scss'
})
export class DesignationListComponent implements OnInit {
  designations: Designation[] = [];
  loading: boolean = true;
  // statuses: any[] = [
  //   { label: 'Active', value: 'active' },
  //   { label: 'Inactive', value: 'inactive' }
  // ];

  statuses: any[] = [];

  integrationOptions: any[] = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];

  activityValues: number[] = [0, 100];

  // Dialog properties
  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  selectedDesignation: Designation | null = null;
  organizations: Organization[] = [];
  designationTypes: DesignationType[] = [];
  mainDesignations: Designation[] = [];
  isSuperAdmin = false;
  private translations: any = {};

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private designationService: DesignationService,
    private designationTypeService: DesignationTypeService,
    private organizationService: LookupService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private authService: AuthService,
    private translationService: TranslationService,
    private translatePipe: TranslatePipe,
  ) {}

  ngOnInit() {
    this.isSuperAdmin = this.checkIsSuperAdmin();
    this.translationService.translations$.subscribe(trans => {
        this.translations = trans;
        this.statuses = [
            { label: this.translations.designationList?.statusValues?.active || 'Active', value: 'active' },
            { label: this.translations.designationList?.statusValues?.inactive || 'Inactive', value: 'inactive' }
        ];
    });

    this.loadDesignations();
    this.loadOrganizations();
    this.loadDesignationTypes();
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

  loadDesignationTypes(): void {
    this.designationTypeService.getAllDesignationTypes().subscribe({
      next: (response: ApiResponse<DesignationType[]>) => {
        if (response.succeeded) {
          this.designationTypes = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading designation types:', error);
      }
    });
  }

  updateMainDesignations(): void {
    this.mainDesignations = this.designations.filter(designation => designation.designationsTypeLookupId === 1);
  }

  loadDesignations() {
    this.loading = true;
    this.designationService.getAllDesignations().subscribe({
      next: (response: ApiResponse<Designation[]>) => {
        if (response.succeeded) {
          this.designations = response.data;
          this.updateMainDesignations();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load designations'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading designations:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load designations'
        });
        this.loading = false;
      }
    });
  }

  getStatus(designation: Designation): string {
    return designation.isDeleted ? 'inactive' : 'active';
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
    this.selectedDesignation = null;
    this.dialogVisible = true;
  }

  openEditDialog(designation: Designation) {
    this.isEditMode = true;
    this.selectedDesignation = designation;
    this.dialogVisible = true;
  }

  onDesignationSaved(designation: Designation) {
    this.loadDesignations();
  }


  deleteDesignation(designation: Designation) {
    const message = this.translatePipe.transform('designationList.messages.deleteConfirm').replace('{name}', designation.name);
    this.confirmationService.confirm({
      message: message,
      header: this.translatePipe.transform('common.deleteHeader'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.designationService.deleteDesignation(designation.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Designation ${designation.name} deleted successfully`
              });
              this.loadDesignations();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || 'Failed to delete designation'
              });
            }
          },
          error: (error) => {
            console.error('Error deleting designation:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete designation'
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
