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
import { MessageService } from 'primeng/api';
import { Department } from '@/interfaces/department.interface';
import { DepartmentService } from '../DepartmentService';
import { ApiResponse } from '@/interfaces/apiResponse.interface';
import { Router, RouterModule } from "@angular/router";
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-department-list',
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
    RouterModule,
    DatePipe
  ],
  providers: [MessageService],
  templateUrl: './department-list.html',
  styleUrl: './department-list.scss'
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  loading: boolean = true;
  statuses: any[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  integrationOptions: any[] = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];

  activityValues: number[] = [0, 100];

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private departmentService: DepartmentService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.loading = true;
    this.departmentService.getAllDepartments().subscribe({
      next: (response: ApiResponse<Department[]>) => {
        if (response.succeeded) {
          this.departments = response.data;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load departments'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load departments'
        });
        this.loading = false;
      }
    });
  }

  getStatus(department: Department): string {
    return department.isDeleted ? 'inactive' : 'active';
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

  getIntegrationSeverity(fromIntegration: boolean) {
    return fromIntegration ? 'warning' : 'info';
  }

  navigateToAdd() {
    this.router.navigate(['/departments/add']);
  }

  navigateToEdit(id: number) {
    this.router.navigate(['/departments/edit', id]);
  }

  deleteDepartment(department: Department) {
    console.log('Deleting department:', department);
    this.messageService.add({
      severity: 'warn',
      summary: 'Delete',
      detail: `Are you sure you want to delete ${department.name}?`,
      life: 3000
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
