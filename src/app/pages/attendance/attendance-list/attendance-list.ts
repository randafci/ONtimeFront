import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Attendance, AttendanceFilter } from '../../../interfaces/attendance.interface';
import { Employee } from '../../../interfaces/employee.interface';
import { AttendanceService } from '../AttendanceService';
import { EmployeeService } from '../../employee/EmployeeService';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { AttendanceModalComponent } from '../attendance-modal/attendance-modal.component';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    InputIconModule,
    IconFieldModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    DatePickerModule,
    TagModule,
    AttendanceModalComponent,
    TranslatePipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './attendance-list.html',
  styleUrl: './attendance-list.scss'
})
export class AttendanceListComponent implements OnInit {
  attendances: Attendance[] = [];
  employees: Employee[] = [];
  loading: boolean = true;
  private translations: any = {};
  
  // Filter form
  filterForm: FormGroup;
  
  // Modal state
  showModal: boolean = false;
  isEditMode: boolean = false;
  selectedAttendance: Attendance | null = null;

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translationService: TranslationService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      employeeId: [null],
      from: [null],
      to: [null]
    });
  }

  ngOnInit() {
    // Check if user is authenticated
    if (!this.authService.isLoggedIn()) {
      this.showToast('error', 'Authentication Required', 'Please log in to access attendance records');
      return;
    }

    this.translationService.translations$.subscribe(trans => {
      this.translations = trans;
    });
    this.loadEmployees();
    this.loadAttendance();
    
    // Watch for form changes to provide immediate feedback
    this.filterForm.valueChanges.subscribe(value => {
      // You can add real-time filtering logic here if needed
      // For now, we'll just show that the form has changed
    });
  }

  loadEmployees() {
    this.employeeService.getAllEmployees().subscribe({
      next: (response: ApiResponse<Employee[]>) => {
        if (response.succeeded) {
          this.employees = (response.data || []).map(emp => ({
            ...emp,
            displayName: `${emp.firstName} ${emp.lastName} (${emp.employeeCode})`
          }));
        }
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });
  }

  loadAttendance() {
    this.loading = true;
    
    // Always load all employees attendance data initially
    this.attendanceService.getAllEmployeesAttendance().subscribe({
      next: (response: ApiResponse<Attendance[]>) => {
        if (response.succeeded) {
          this.attendances = response.data || [];
        } else {
          this.showToast('error', 'Error', response.message || 'Failed to load attendance');
        }
        this.loading = false;
      },
      error: (error) => {
        this.showToast('error', 'Error', 'Failed to load attendance');
        this.loading = false;
      }
    });
  }

  searchAttendance() {
    const filter: AttendanceFilter = this.filterForm.value;
    this.loading = true;
    
    // Use searchAttendance which handles both cases (all employees vs specific employee)
    this.attendanceService.searchAttendance(filter).subscribe({
      next: (response: ApiResponse<Attendance[]>) => {
        if (response.succeeded) {
          this.attendances = response.data || [];
          const message = filter.employeeId 
            ? `Found ${response.data?.length || 0} attendance records for selected employee`
            : `Found ${response.data?.length || 0} attendance records for all employees`;
          this.showToast('success', 'Search Complete', message);
        } else {
          this.showToast('error', 'Error', response.message || 'Search failed');
        }
        this.loading = false;
      },
      error: (error) => {
        this.showToast('error', 'Error', 'Search failed');
        this.loading = false;
      }
    });
  }

  clearFilters() {
    this.filterForm.reset();
    // Use searchAttendance with empty filter to load all employees' data
    this.attendanceService.searchAttendance({}).subscribe({
      next: (response: ApiResponse<Attendance[]>) => {
        if (response.succeeded) {
          this.attendances = response.data || [];
          this.showToast('info', 'Filters Cleared', 'All filters have been reset');
        } else {
          this.showToast('error', 'Error', response.message || 'Failed to load data');
        }
      },
      error: (error) => {
        this.showToast('error', 'Error', 'Failed to load data');
      }
    });
  }

  onEmployeeChange() {
    // This method can be called when employee selection changes
    // It provides immediate feedback without auto-loading data
    const selectedEmployee = this.filterForm.get('employeeId')?.value;
    
    if (selectedEmployee) {
      const employee = this.employees.find(emp => emp.id === selectedEmployee);
      if (employee) {
        this.showToast('info', 'Employee Selected', `Selected: ${employee.firstName} ${employee.lastName}. Click Search to filter data.`);
      }
    }
  }

  hasActiveFilters(): boolean {
    const formValue = this.filterForm.value;
    return !!(formValue.employeeId || formValue.from || formValue.to);
  }

  getEmployeeName(employeeId: number): string {
    const employee = this.employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : `Employee ID: ${employeeId}`;
  }

  getEmployeeCode(employeeId: number): string {
    const employee = this.employees.find(emp => emp.id === employeeId);
    return employee ? employee.employeeCode : '';
  }

  getVerifyStatusSeverity(status: string): string {
    switch (status?.toLowerCase()) {
      case 'fingerprint': return 'success';
      case 'card': return 'info';
      case 'manual': return 'warning';
      default: return 'info';
    }
  }

  getPunchTypeSeverity(type: string): string {
    switch (type?.toLowerCase()) {
      case 'check in': return 'success';
      case 'check out': return 'danger';
      case 'break in': return 'warning';
      case 'break out': return 'info';
      default: return 'info';
    }
  }

  getVerifyStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'fingerprint': return 'pi pi-fingerprint';
      case 'card': return 'pi pi-id-card';
      case 'manual': return 'pi pi-pencil';
      default: return 'pi pi-info-circle';
    }
  }

  getPunchTypeIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'check in': return 'pi pi-sign-in';
      case 'check out': return 'pi pi-sign-out';
      case 'break in': return 'pi pi-pause';
      case 'break out': return 'pi pi-play';
      default: return 'pi pi-clock';
    }
  }

  openAddModal() {
    this.isEditMode = false;
    this.selectedAttendance = null;
    this.showModal = true;
  }

  openEditModal(attendance: Attendance) {
    this.isEditMode = true;
    this.selectedAttendance = attendance;
    this.showModal = true;
  }

  onModalSave(attendance: Attendance) {
    this.showModal = false;
    // Refresh the attendance list to show the new record
    this.loadAttendance();
  }

  onModalCancel() {
    this.showModal = false;
  }

  deleteAttendance(attendance: Attendance) {
    const employeeName = this.getEmployeeName(attendance.employeeId);
    const message = `Are you sure you want to delete attendance record for ${employeeName}?`;

    this.confirmationService.confirm({
      message: message,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.attendanceService.deleteAttendance(attendance.id || 0).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.showToast('success', 'Success', 'Attendance record deleted successfully');
              this.loadAttendance();
            } else {
              this.showToast('error', 'Error', response.message || 'Failed to delete attendance');
            }
          },
          error: () => this.showToast('error', 'Error', 'Failed to delete attendance')
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

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

}
