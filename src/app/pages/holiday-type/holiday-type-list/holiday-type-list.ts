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
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HolidayTypeList } from '../../../interfaces/holiday-type.interface';
import { HolidayTypeService } from '../HolidayTypeService';
import { Router, RouterModule } from "@angular/router";
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { HolidayTypeModalComponent } from '../holiday-type-modal/holiday-type-modal.component';
import { Organization } from '../../../interfaces/organization.interface';
import { LookupService } from '../../organization/OrganizationService';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-holiday-type-list',
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
    TooltipModule,
    RouterModule,
    ConfirmDialogModule,
    HolidayTypeModalComponent,
    TranslatePipe
  ],
  providers: [MessageService, ConfirmationService, TranslatePipe],
  templateUrl: './holiday-type-list.html'
})
export class HolidayTypeListComponent implements OnInit {
  holidayTypes: HolidayTypeList[] = [];
  loading: boolean = true;

  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  selectedHolidayType: HolidayTypeList | null = null;
  organizations: Organization[] = [];
  isSuperAdmin = false;

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private holidayTypeService: HolidayTypeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private authService: AuthService,
    private organizationService: LookupService,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit() {
    this.isSuperAdmin = this.checkIsSuperAdmin();
    this.loadHolidayTypes();
    this.loadOrganizations();
  }

  private checkIsSuperAdmin(): boolean {
    const claims = this.authService.getClaims();
    return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
  }

  loadHolidayTypes() {
    this.loading = true;
    this.holidayTypeService.getAllHolidayTypes().subscribe({
      next: (response: ApiResponse<HolidayTypeList[]>) => {
        if (response.succeeded) {
          this.holidayTypes = response.data;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.translatePipe.transform('holidayTypeList.messages.loadError')
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading holiday types:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.translatePipe.transform('holidayTypeList.messages.loadError')
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
        // Silent error handling
      }
    });
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.selectedHolidayType = null;
    this.dialogVisible = true;
  }

  openEditDialog(holidayType: HolidayTypeList) {
    this.isEditMode = true;
    this.selectedHolidayType = holidayType;
    this.dialogVisible = true;
  }

  onHolidayTypeSaved(holidayType: HolidayTypeList) {
    this.loadHolidayTypes();
  }

  deleteHolidayType(holidayType: HolidayTypeList) {
    const message = this.translatePipe.transform('holidayTypeList.messages.deleteConfirm').replace('{name}', holidayType.name);
    this.confirmationService.confirm({
       message: message,
      header: this.translatePipe.transform('common.deleteHeader'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.holidayTypeService.deleteHolidayType(holidayType.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: this.translatePipe.transform('holidayTypeList.messages.deleteSuccess')
              });
              this.loadHolidayTypes();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || this.translatePipe.transform('holidayTypeList.messages.deleteError')
              });
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.translatePipe.transform('holidayTypeList.messages.deleteError')
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
