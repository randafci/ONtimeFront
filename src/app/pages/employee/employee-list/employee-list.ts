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
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Employee } from '../../../interfaces/employee.interface';
import { EmployeeService } from '../EmployeeService';

import { Router, RouterModule, NavigationEnd } from "@angular/router";
import { DatePipe } from '@angular/common';
import { filter } from 'rxjs/operators';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';


@Component({
  selector: 'app-employee-list',
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
    TranslatePipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss'
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  loading: boolean = true;
  // statuses: any[] = [
  //   { label: 'Active', value: 'active' },
  //   { label: 'Inactive', value: 'inactive' },
  //   { label: 'On Leave', value: 'on leave' },
  //   { label: 'Terminated', value: 'terminated' },
  //   { label: 'Suspended', value: 'suspended' },
  //   { label: 'Probation', value: 'probation' }
  // ];

  statuses: any[] = [];
  private translations: any = {}; // Store translations

  activityValues: number[] = [0, 100];

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private employeeService: EmployeeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    this.translationService.translations$.subscribe(trans => {
      this.translations = trans;
      this.initializeStatuses(); // Initialize statuses when translations load
    });
    this.loadEmployees();
    
    // Reload employees when navigating back to this component
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Only reload if we're on the employee list page
      if (event.url === '/employees' || event.url.startsWith('/employees')) {
        console.log('Navigation detected, reloading employees...');
        this.loadEmployees();
      }
    });
  }
  initializeStatuses(): void {
    const statusKeys = ['active', 'inactive', 'onLeave', 'terminated', 'suspended', 'probation'];
    this.statuses = statusKeys.map(key => ({
      label: this.translations.employees?.listPage?.statuses?.[key] || key,
      value: key
    }));
  }

  loadEmployees() {
    console.log('Loading employees...');
    this.loading = true;
    this.employeeService.getAllEmployees().subscribe({
      next: (response: ApiResponse<Employee[]>) => {
        if (response.succeeded) {
          console.log('Employees loaded successfully:', response.data.length, 'employees');
          this.employees = response.data;
        } else {
          console.error('Failed to load employees:', response.message);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load employees'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load employees'
        });
        this.loading = false;
      }
    });
  }

  getStatus(employee: Employee): string {
    // First check if employee is deleted (soft delete)
    if (employee.isDeleted) {
      return 'inactive';
    }
    
    // Then check the actual employeeStatus field
    if (employee.employeeStatus) {
      return employee.employeeStatus.toLowerCase();
    }
    
    // Default to active if no status is set
    return 'active';
  }

  getFullName(employee: Employee): string {
    if (employee.firstName && employee.lastName) {
      return `${employee.firstName} ${employee.lastName}`;
    } else if (employee.firstName) {
      return employee.firstName;
    } else if (employee.lastName) {
      return employee.lastName;
    } else {
      return 'N/A';
    }
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

  navigateToAdd() {
    this.router.navigate(['/employees/add']);
  }

  navigateToEdit(id: number) {
    this.router.navigate(['/employees/edit', id]);
  }

  navigateToEmployments(employee: Employee) {
    const employeeName = this.getFullName(employee);
    this.router.navigate(['/employees/employments', employee.id, employeeName]);
  }

  deleteEmployee(employee: Employee) {
    const trans = this.translations.employees?.listPage?.messages;
    const commonTrans = this.translations.employees?.common;

    this.confirmationService.confirm({
      message: (trans?.deleteConfirm || 'Are you sure you want to delete {name}?')
               .replace('{name}', this.getFullName(employee)),
      header: commonTrans?.confirmDelete || 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: commonTrans?.yes || 'Yes',
      rejectLabel: commonTrans?.no || 'No',
      accept: () => {
        this.employeeService.deleteEmployee(employee.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Employee ${this.getFullName(employee)} deleted successfully.`
              });
              this.loadEmployees(); // Reload employees after deletion
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || 'Failed to delete employee'
              });
            }
          },
          error: (error) => {
            console.error('Error deleting employee:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete employee'
            });
          }
        });
      },
      reject: () => {
        // User cancelled the deletion
        this.messageService.add({
          severity: 'info',
          summary: commonTrans?.cancelled || 'Cancelled',
          detail: trans?.deleteCancelled || 'Delete operation cancelled'
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
