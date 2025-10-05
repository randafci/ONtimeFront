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
    AttendanceModalComponent
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
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      staffId: [null],
      punchDate: [null]
    });
  }

  ngOnInit() {
    this.translationService.translations$.subscribe(trans => {
      this.translations = trans;
    });
    this.loadEmployees();
    this.loadAttendance();
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
    this.attendanceService.getAllAttendance().subscribe({
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
    
    this.attendanceService.searchAttendance(filter).subscribe({
      next: (response: ApiResponse<Attendance[]>) => {
        if (response.succeeded) {
          this.attendances = response.data || [];
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
    this.loadAttendance();
  }

  getEmployeeName(staffId: number): string {
    const employee = this.employees.find(emp => emp.id === staffId);
    return employee ? `${employee.firstName} ${employee.lastName}` : `Staff ID: ${staffId}`;
  }

  getEmployeeCode(staffId: number): string {
    const employee = this.employees.find(emp => emp.id === staffId);
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
    this.loadAttendance();
  }

  onModalCancel() {
    this.showModal = false;
  }

  deleteAttendance(attendance: Attendance) {
    const employeeName = this.getEmployeeName(attendance.staffId);
    const message = `Are you sure you want to delete attendance record for ${employeeName}?`;

    this.confirmationService.confirm({
      message: message,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.attendanceService.deleteAttendance(attendance.id).subscribe({
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
