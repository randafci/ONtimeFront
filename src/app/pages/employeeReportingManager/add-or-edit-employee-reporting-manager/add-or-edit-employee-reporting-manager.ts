import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Company } from '@/interfaces/company.interface';
import { Department } from '@/interfaces/department.interface';
import { 
  ReportingManagerLookupDto, 
  EmployeeList, 
  EmployeeFilterDto, 
  EmployeeReportingManagerUpdateDto 
} from '@/interfaces/employeeReportingManager.interface';

import { EmployeeReportingManagerService } from '../employeeReportingManager.service';
import { ApiResponse } from '@/core/models/api-response.model';

import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslatePipe } from '@/core/pipes/translate.pipe';

// PrimeNG UI modules
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SliderModule } from 'primeng/slider';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-add-or-edit-employee-reporting-manager',
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
    SelectButtonModule,
    ToastModule,
    RouterModule,
    ConfirmDialogModule,
    TooltipModule,
    TranslatePipe,
    Dialog
  ],
  templateUrl: './add-or-edit-employee-reporting-manager.html',
  styleUrls: ['./add-or-edit-employee-reporting-manager.scss'],
  providers: [MessageService, ConfirmationService],
})
export class AddOrEditEmployeeReportingManager implements OnInit {
  companies: Company[] = [];
  departments: Department[] = [];
  reportingManagers: ReportingManagerLookupDto[] = [];
  employees: EmployeeList[] = [];

  employeeSearchValue: string = '';

  selectedCompanyId: number | null = null;
  selectedDepartmentId: number | null = null;
  selectedReportingManagerId: number | null = null;

  selectedReportMangerEmployeeId: number | null = null;
  employeesList: EmployeeList[] = [];
  selectedEmployees: EmployeeList[] = [];

  loading: boolean = false;
  applyDialogVisible = false;
  level: number | null = null;

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private ermService: EmployeeReportingManagerService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadDepartments();
    this.loadReportingManagers();
  }

  /** Navigation stubs (TODO: implement properly) */
  navigateToAdd() {
    console.warn('navigateToAdd not implemented yet');
  }
  navigateToEmployments(emp: EmployeeList) {
    console.warn('navigateToEmployments not implemented yet', emp);
  }

  /** 🔹 Load Companies */
  loadCompanies(): void {
    this.ermService.getAllCompanies().subscribe({
      next: (res: ApiResponse<Company[]>) => {
        if (res.succeeded) {
          this.companies = res.data;
        } else {
          this.showError(res.message || 'Failed to load companies');
        }
      },
      error: () => this.showError('Failed to load companies'),
    });
  }

  /** 🔹 Load Departments */
  loadDepartments(): void {
    this.ermService.getAllDepartments().subscribe({
      next: (res: ApiResponse<Department[]>) => {
        if (res.succeeded) {
          this.departments = res.data;
        } else {
          this.showError(res.message || 'Failed to load departments');
        }
      },
      error: () => this.showError('Failed to load departments'),
    });
  }

  /** 🔹 Load Reporting Managers */
  loadReportingManagers(): void {
    this.ermService.getAllReportingManagers().subscribe({
      next: (res: ApiResponse<ReportingManagerLookupDto[]>) => {
        if (res.succeeded) {
          this.reportingManagers = res.data;
        } else {
          this.showError(res.message || 'Failed to load reporting managers');
        }
      },
      error: () => this.showError('Failed to load reporting managers'),
    });
  }

  /** 🔹 Filter Employees (for main table) */
  filterEmployees(): void {
    const filter: EmployeeFilterDto = {
      CompanyId: this.selectedCompanyId ?? undefined,
      DepartmentId: this.selectedDepartmentId ?? undefined,
      ReportingManagerId: this.selectedReportingManagerId ?? undefined,
    };

    this.loading = true;
    this.ermService.getFilteredEmployees(filter).subscribe({
      next: (res: ApiResponse<EmployeeList[]>) => {
        if (res.succeeded) {
          this.employees = res.data;
        } else {
          this.showError(res.message || 'Failed to load employees');
        }
        this.loading = false;
      },
      error: () => {
        this.showError('Failed to load employees');
        this.loading = false;
      },
    });
  }

  /** 🔹 Filter Employees (for popup dropdown) */
  filterEmployeesForSelectedManger(): void {
    const filter: EmployeeFilterDto = {
      CompanyId: this.selectedCompanyId ?? undefined,
      DepartmentId: this.selectedDepartmentId ?? undefined,
      ReportingManagerId: this.selectedReportingManagerId ?? undefined,
    };

    this.ermService.getFilteredEmployees(filter).subscribe({
      next: (res: ApiResponse<EmployeeList[]>) => {
        if (res.succeeded) {
          this.employeesList = res.data;
        } else {
          this.showError(res.message || 'Failed to load employees');
        }
      },
      error: () => this.showError('Failed to load employees'),
    });
  }

  /** 🔹 Utility for error toast */
  private showError(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail,
    });
  }


  clear(table: Table) {
    table.clear();
    if (this.filter) this.filter.nativeElement.value = '';
  }

  openApplyPopup() {
    this.filterEmployeesForSelectedManger();
    this.applyDialogVisible = true;
  }

  /** 🔹 Apply Action */
 applyAction() {
  console.log("selectedReportMangerEmployeeId ", this.selectedReportMangerEmployeeId);
  console.log("selectedEmployees ", this.selectedEmployees);

  if (!this.selectedReportMangerEmployeeId || !this.selectedEmployees?.length) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Validation',
      detail: 'Please select a reporting manager and at least one employee.',
    });
    return;
  }

  const dto: EmployeeReportingManagerUpdateDto = {
    employeeIds: this.selectedEmployees.map(emp => emp.id),
    reportingManagerId: this.selectedReportMangerEmployeeId,
    level: this.level ?? 0,
  };

  this.ermService.update(dto).subscribe({
    next: (res: ApiResponse<any>) => { // Change from boolean to any
      if (res.succeeded) {
        // Check if all operations were successful
        const allSuccessful = res.data.every((result: any) => result.success);
        
        if (allSuccessful) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Reporting manager updated successfully for all employees',
          });
        } else {
          // Some operations failed - show individual errors
          const failedUpdates = res.data.filter((result: any) => !result.success);
          const errorMessages = failedUpdates.map((result: any) => 
            `Employee ${result.employeeId}: ${result.message}`
          ).join('\n');
          
          this.messageService.add({
            severity: 'warn',
            summary: 'Partial Success',
            detail: `Some updates failed:\n${errorMessages}`,
            life: 10000 // Show for 10 seconds
          });
        }
        
        this.applyDialogVisible = false;
        this.filterEmployees(); // reload main table
      } else {
        this.showError(res.message || 'Update failed');
      }
    },
    error: (err) => {
      console.error(err);
      this.showError('Something went wrong');
    },
  });
}


  clearTable(table: Table) {
  table.clear();
  this.employeeSearchValue = '';
  // Also clear any other filters you have
  this.selectedCompanyId = null;
  this.selectedDepartmentId = null;
  this.selectedReportingManagerId = null;
  this.filterEmployees();
}

onGlobalFilter(table: Table, event: Event) {
  const value = (event.target as HTMLInputElement).value;
  this.employeeSearchValue = value;
  table.filterGlobal(value, 'contains');
}
}
