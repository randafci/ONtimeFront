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
  statuses: any[] = [];
  private translations: any = {};

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
      this.initializeStatuses();
    });
    this.loadEmployees();

    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url.startsWith('/employees')) {
          this.loadEmployees();
        }
      });
  }

  initializeStatuses(): void {
    const statusKeys = ['active', 'inactive', 'onLeave', 'terminated', 'suspended', 'probation'];
    const statusTrans = this.translations.employees?.listPage?.statuses;
    if (statusTrans) {
      this.statuses = statusKeys.map(key => ({
        label: statusTrans[key] || key,
        value: key
      }));
    }
  }

  loadEmployees() {
    this.loading = true;
    this.employeeService.getAllEmployees().subscribe({
      next: (response: ApiResponse<Employee[]>) => {
        if (response.succeeded) {
          this.employees = response.data;
        } else {
          this.showToast('error', 'Error', response.message || this.translations.employees?.listPage?.messages?.loadError);
        }
        this.loading = false;
      },
      error: (error) => {
        this.showToast('error', 'Error', this.translations.employees?.listPage?.messages?.loadError);
        this.loading = false;
      }
    });
  }

  getStatus(employee: Employee): string {
    if (employee.isDeleted) return 'inactive';
    return employee.employeeStatus?.toLowerCase() || 'active';
  }

  getFullName(employee: Employee): string {
    return `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'N/A';
  }

  getSeverity(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'onleave': return 'warning';
      case 'terminated': return 'danger';
      case 'suspended': return 'warning';
      case 'probation': return 'info';
      default: return 'info';
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
    const trans = this.translations.employees?.listPage?.messages || {};
    const commonTrans = this.translations.common || {};
    const message = (trans.deleteConfirm || 'Are you sure you want to delete {name}?').replace('{name}', this.getFullName(employee));

    this.confirmationService.confirm({
      message: message,
      header: commonTrans.confirmDelete || 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: commonTrans.yes || 'Yes',
      rejectLabel: commonTrans.no || 'No',
      accept: () => {
        this.employeeService.deleteEmployee(employee.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              const successMsg = (trans.deleteSuccess || 'Employee {name} deleted successfully.').replace('{name}', this.getFullName(employee));
              this.showToast('success', commonTrans.success, successMsg);
              this.loadEmployees();
            } else {
              this.showToast('error', commonTrans.error, response.message || trans.deleteError);
            }
          },
          error: () => this.showToast('error', commonTrans.error, trans.deleteError)
        });
      },
      reject: () => {
        this.showToast('info', trans.cancelled || 'Cancelled', trans.deleteCancelled);
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
