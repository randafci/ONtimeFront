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
import { LeaveRequest, LeaveRequestStatus } from '../../../interfaces/leave-request.interface';
import { LeaveRequestService } from '../LeaveRequestService';
import { Router, RouterModule } from "@angular/router";
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { LeaveRequestModalComponent } from '../leave-request-modal/leave-request-modal.component';
import { EmployeeEmployment } from '../../../interfaces/employee-employment.interface';
import { LeaveType } from '../../../interfaces/leave-type.interface';
import { Workflow } from '../../../interfaces/workflow.interface';
import { EmployeeService } from '../../employee/EmployeeService';
import { LeaveTypeService } from '../../leave-type/LeaveTypeService';
import { WorkflowService } from '../../workflow/WorkflowService';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-leave-request-list',
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
    LeaveRequestModalComponent,
    TranslatePipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './leave-request-list.html'
})
export class LeaveRequestListComponent implements OnInit {
  leaveRequests: LeaveRequest[] = [];
  loading: boolean = true;
  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  selectedLeaveRequest: LeaveRequest | null = null;
  employeeEmployments: EmployeeEmployment[] = [];
  leaveTypes: LeaveType[] = [];
  workflows: Workflow[] = [];
  isSuperAdmin = false;
  private translations: any = {};

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private leaveRequestService: LeaveRequestService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private employeeService: EmployeeService,
    private leaveTypeService: LeaveTypeService,
    private workflowService: WorkflowService,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });
    this.isSuperAdmin = this.checkIsSuperAdmin();
    this.loadLeaveRequests();
    this.loadLookupData();
  }

  private checkIsSuperAdmin(): boolean {
    const claims = this.authService.getClaims();
    return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
  }

  loadLeaveRequests() {
    this.loading = true;
    this.leaveRequestService.getAllLeaveRequests().subscribe({
      next: (response: ApiResponse<LeaveRequest[]>) => {
        if (response.succeeded) {
          this.leaveRequests = response.data;
        } else {
          this.showToast('error', this.translations.common?.error, response.message || this.translations.leaveRequestList?.messages?.loadError);
        }
        this.loading = false;
      },
      error: () => {
        this.showToast('error', this.translations.common?.error, this.translations.leaveRequestList?.messages?.loadError);
        this.loading = false;
      }
    });
  }

  loadLookupData(): void {
    // Load Employee Employments
    this.employeeService.getAllEmployeeEmployments().subscribe({
      next: (response: ApiResponse<EmployeeEmployment[]>) => {
        if (response.succeeded) this.employeeEmployments = response.data;
      },
      error: (error) => console.error('Error loading employee employments:', error)
    });

    // Load Leave Types
    this.leaveTypeService.getAllLeaveTypes().subscribe({
      next: (response: ApiResponse<LeaveType[]>) => {
        if (response.succeeded) this.leaveTypes = response.data;
      },
      error: (error) => console.error('Error loading leave types:', error)
    });

    // Load Workflows
    this.workflowService.getAllWorkflows().subscribe({
      next: (response: ApiResponse<Workflow[]>) => {
        if (response.succeeded) this.workflows = response.data;
      },
      error: (error) => console.error('Error loading workflows:', error)
    });
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.selectedLeaveRequest = null;
    this.dialogVisible = true;
  }

  openEditDialog(leaveRequest: LeaveRequest) {
    this.isEditMode = true;
    this.selectedLeaveRequest = leaveRequest;
    this.dialogVisible = true;
  }

  onLeaveRequestSaved(leaveRequest: LeaveRequest) {
    this.loadLeaveRequests();
  }

  deleteLeaveRequest(leaveRequest: LeaveRequest) {
    const trans = this.translations.leaveRequestList?.messages || {};
    const commonTrans = this.translations.common || {};
    const message = (trans.deleteConfirm || 'Are you sure you want to delete this leave request?');

    this.confirmationService.confirm({
      message: message,
      header: commonTrans.deleteHeader || 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.leaveRequestService.deleteLeaveRequest(leaveRequest.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.showToast('success', commonTrans.success, trans.deleteSuccess);
              this.loadLeaveRequests();
            } else {
              this.showToast('error', commonTrans.error, response.message || trans.deleteError);
            }
          },
          error: () => this.showToast('error', commonTrans.error, trans.deleteError)
        });
      }
    });
  }

  updateStatus(leaveRequest: LeaveRequest, status: LeaveRequestStatus) {
    const trans = this.translations.leaveRequestList?.messages || {};
    const commonTrans = this.translations.common || {};
    
    this.leaveRequestService.updateLeaveRequestStatus(leaveRequest.id, { status }).subscribe({
      next: (response: ApiResponse<LeaveRequest>) => {
        if (response.succeeded) {
          this.showToast('success', commonTrans.success, trans.statusUpdateSuccess);
          this.loadLeaveRequests();
        } else {
          this.showToast('error', commonTrans.error, response.message || trans.statusUpdateError);
        }
      },
      error: () => this.showToast('error', commonTrans.error, trans.statusUpdateError)
    });
  }

  getStatusSeverity(status: LeaveRequestStatus): string {
    switch (status) {
      case LeaveRequestStatus.Pending:
        return 'warning';
      case LeaveRequestStatus.Approved:
        return 'success';
      case LeaveRequestStatus.Rejected:
        return 'danger';
      case LeaveRequestStatus.Cancelled:
        return 'secondary';
      default:
        return 'info';
    }
  }

  getStatusLabel(status: LeaveRequestStatus): string {
    switch (status) {
      case LeaveRequestStatus.Pending:
        return 'Pending';
      case LeaveRequestStatus.Approved:
        return 'Approved';
      case LeaveRequestStatus.Rejected:
        return 'Rejected';
      case LeaveRequestStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}
