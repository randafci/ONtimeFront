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
import { LeaveType } from '../../../interfaces/leave-type.interface';
import { LeaveTypeService } from '../LeaveTypeService';
import { Router, RouterModule } from "@angular/router";
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { LeaveTypeModalComponent } from '../leave-type-modal/leave-type-modal.component';
import { Organization } from '../../../interfaces/organization.interface';
import { LookupService } from '../../organization/OrganizationService';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-leave-type-list',
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
    LeaveTypeModalComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './leave-type-list.html'
})
export class LeaveTypeListComponent implements OnInit {
  leaveTypes: LeaveType[] = [];
  loading: boolean = true;

  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  selectedLeaveType: LeaveType | null = null;
  organizations: Organization[] = [];
  isSuperAdmin = false;

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private leaveTypeService: LeaveTypeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private authService: AuthService,
    private organizationService: LookupService
  ) {}

  ngOnInit() {
    this.isSuperAdmin = this.checkIsSuperAdmin();
    this.loadLeaveTypes();
    this.loadOrganizations();
  }

  private checkIsSuperAdmin(): boolean {
    const claims = this.authService.getClaims();
    return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
  }

  loadLeaveTypes() {
    this.loading = true;
    this.leaveTypeService.getAllLeaveTypes().subscribe({
      next: (response: ApiResponse<LeaveType[]>) => {
        if (response.succeeded) {
          this.leaveTypes = response.data;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load leave types'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading leave types:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load leave types'
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
    this.selectedLeaveType = null;
    this.dialogVisible = true;
  }

  openEditDialog(leaveType: LeaveType) {
    this.isEditMode = true;
    this.selectedLeaveType = leaveType;
    this.dialogVisible = true;
  }

  onLeaveTypeSaved(leaveType: LeaveType) {
    this.loadLeaveTypes();
  }

  deleteLeaveType(leaveType: LeaveType) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${leaveType.name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.leaveTypeService.deleteLeaveType(leaveType.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Leave type deleted successfully'
              });
              this.loadLeaveTypes();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || 'Failed to delete leave type'
              });
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete leave type'
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
