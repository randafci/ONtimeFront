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
  EmployeeReportingManagerUpdateDto, 
  ManagerConflictResolution
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
import { DialogModule } from 'primeng/dialog';

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
    DialogModule,
    TooltipModule,
    TranslatePipe,
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

  conflictDialogVisible = false;
conflictEmployees: { employeeName: string; conflictingManagers: string[] }[] = [];


  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;
  ManagerConflictResolution = ManagerConflictResolution;

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
 this.ermService.getFilteredEmployees(filter).subscribe(response => {
  this.loading = false;
  if (response.succeeded) {
    this.employees = response.data;   // 🔹 bind to table
  } else {
    this.showError(response.message || 'Failed to load employees');
    this.employees = []; // clear on failure
  }
});

  }

  /** 🔹 Filter Employees (for popup dropdown) */
  filterEmployeesForSelectedManger(): void {
    const filter: EmployeeFilterDto = {
      CompanyId: this.selectedCompanyId ?? undefined,
      DepartmentId: this.selectedDepartmentId ?? undefined,
      ReportingManagerId: this.selectedReportingManagerId ?? undefined,
    };

 this.ermService.getFilteredEmployees(filter).subscribe(response => {
  this.loading = false;
  if (response.succeeded) {
    this.employees = response.data;   // 🔹 bind to table
   this.employeesList = response.data;

  } else {
    this.showError(response.message || 'Failed to load employees');
    this.employees = []; // clear on failure
  }
});

  }


  getManagersDisplay(emp: EmployeeList): string {
  if (!emp.reportingManagers?.length) return 'N/A';
  return emp.reportingManagers.map(mgr => mgr.name).join(', ');
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
  if (!this.selectedReportMangerEmployeeId || !this.selectedEmployees?.length) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Validation',
      detail: 'Please select a reporting manager and at least one employee.',
    });
    return;
  }

  // 🔹 Detect conflicts
  const conflicts: { employeeName: string; conflictingManagers: string[] }[] = [];

  this.selectedEmployees.forEach(emp => {
   const levelNum = Number(this.level);
    const sameLevelMgrs = emp.reportingManagers?.filter(
      mgr => mgr.level === levelNum
    ) || [];


    if (sameLevelMgrs.length > 0) {
      conflicts.push({
        employeeName: emp.employeeName,
        conflictingManagers: sameLevelMgrs.map(m => m.name),
      });
    }
  });

  if (conflicts.length > 0) {
    this.conflictEmployees = conflicts;
    this.conflictDialogVisible = true;
    return; // stop here, wait for user decision
  }

  // ✅ No conflicts → proceed directly

  this.sendUpdate(ManagerConflictResolution.Continue);
}

sendUpdate(resolution: ManagerConflictResolution) {
    this.conflictDialogVisible = false; // close immediately

if (resolution == ManagerConflictResolution.Ignore)
{
return;
}
  const dto: EmployeeReportingManagerUpdateDto = {
    employeeIds: this.selectedEmployees.map(emp => emp.id),
    reportingManagerId: this.selectedReportMangerEmployeeId!,
    level: this.level ?? 0,
    managerConflictResolution: resolution
  };

  this.ermService.update(dto).subscribe({
    next: (res: ApiResponse<boolean>) => {
      if (res.succeeded && res.data) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Reporting manager updated successfully',
        });
        this.applyDialogVisible = false;
        this.conflictDialogVisible = false;
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

//#region 
/*   applyAction() {

    console.log("selectedReportMangerEmployeeId " , this.selectedReportMangerEmployeeId )
    console.log("selectedEmployees " , this.selectedEmployees )

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
      managerConflictResolution : ManagerConflictResolution.Ignore // edit according to selection 
    };

    this.ermService.update(dto).subscribe({
      next: (res: ApiResponse<boolean>) => {
        if (res.succeeded && res.data) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Reporting manager updated successfully',
          });
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
  } */

//#endregion
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
