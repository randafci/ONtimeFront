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
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';

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
  private translations: any = {};

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;
  ManagerConflictResolution = ManagerConflictResolution;

  constructor(
    private ermService: EmployeeReportingManagerService,
    private messageService: MessageService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loadCompanies();
    this.loadDepartments();
    this.loadReportingManagers();
  }
  
  loadCompanies(): void {
    this.ermService.getAllCompanies().subscribe({
      next: (res: ApiResponse<Company[]>) => { if (res.succeeded) this.companies = res.data; },
      error: () => this.showToast('error', this.translations.common?.error, this.translations.employeesReporting?.listPage?.toasts?.loadCompaniesError)
    });
  }

  loadDepartments(): void {
    this.ermService.getAllDepartments().subscribe({
      next: (res: ApiResponse<Department[]>) => { if (res.succeeded) this.departments = res.data; },
      error: () => this.showToast('error', this.translations.common?.error, this.translations.employeesReporting?.listPage?.toasts?.loadDepartmentsError)
    });
  }

  loadReportingManagers(): void {
    this.ermService.getAllReportingManagers().subscribe({
      next: (res: ApiResponse<ReportingManagerLookupDto[]>) => { if (res.succeeded) this.reportingManagers = res.data; },
      error: () => this.showToast('error', this.translations.common?.error, this.translations.employeesReporting?.listPage?.toasts?.loadManagersError)
    });
  }

  filterEmployees(): void {
    const filter: EmployeeFilterDto = {
      CompanyId: this.selectedCompanyId ?? undefined,
      DepartmentId: this.selectedDepartmentId ?? undefined,
      ReportingManagerId: this.selectedReportingManagerId ?? undefined,
    };
    this.loading = true;
    this.ermService.getFilteredEmployees(filter).subscribe({
      next: (response) => {
        if (response.succeeded) this.employees = response.data;
        else this.showToast('error', this.translations.common?.error, response.message || this.translations.employeesReporting?.listPage?.toasts?.loadEmployeesError);
        this.loading = false;
      },
      error: () => {
        this.showToast('error', this.translations.common?.error, this.translations.employeesReporting?.listPage?.toasts?.loadEmployeesError);
        this.loading = false;
      }
    });
  }

  getManagersDisplay(emp: EmployeeList): string {
    if (!emp.reportingManagers?.length) return 'N/A';
    return emp.reportingManagers.map((mgr: { name: any; }) => mgr.name).join(', ');
  }

  openApplyPopup() {
    this.applyDialogVisible = true;
  }

  applyAction() {
    const trans = this.translations.employeesReporting?.listPage?.toasts;
    if (!this.selectedReportMangerEmployeeId || !this.selectedEmployees?.length) {
      this.showToast('warn', trans?.validationTitle, trans?.validationMessage);
      return;
    }

    const conflicts: { employeeName: string; conflictingManagers: string[] }[] = [];
    this.selectedEmployees.forEach(emp => {
      const levelNum = Number(this.level);
      const sameLevelMgrs = emp.reportingManagers?.filter((mgr: { level: number; }) => mgr.level === levelNum) || [];
      if (sameLevelMgrs.length > 0) {
        conflicts.push({ employeeName: emp.employeeName, conflictingManagers: sameLevelMgrs.map((m: { name: any; }) => m.name) });
      }
    });

    if (conflicts.length > 0) {
      this.conflictEmployees = conflicts;
      this.conflictDialogVisible = true;
      return;
    }
    this.sendUpdate(ManagerConflictResolution.Continue);
  }

  sendUpdate(resolution: ManagerConflictResolution) {
    this.conflictDialogVisible = false;
    if (resolution === ManagerConflictResolution.Ignore) return;

    const dto: EmployeeReportingManagerUpdateDto = {
      employeeIds: this.selectedEmployees.map(emp => emp.id),
      reportingManagerId: this.selectedReportMangerEmployeeId!,
      level: this.level ?? 0,
      managerConflictResolution: resolution
    };

    this.ermService.update(dto).subscribe({
      next: (res: ApiResponse<boolean>) => {
        if (res.succeeded && res.data) {
          this.showToast('success', this.translations.common?.success, this.translations.employeesReporting?.listPage?.toasts?.updateSuccess);
          this.applyDialogVisible = false;
          this.filterEmployees();
        } else {
          this.showToast('error', this.translations.common?.error, res.message || this.translations.employeesReporting?.listPage?.toasts?.updateError);
        }
      },
      error: () => this.showToast('error', this.translations.common?.error, this.translations.employeesReporting?.listPage?.toasts?.updateError)
    });
  }

  clearTable(table: Table) {
    table.clear();
    this.employeeSearchValue = '';
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
  
  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
  navigateToAdd() {
    console.warn('navigateToAdd not implemented yet');
  }
  navigateToEmployments(emp: EmployeeList) {
    console.warn('navigateToEmployments not implemented yet', emp);
  }
}
