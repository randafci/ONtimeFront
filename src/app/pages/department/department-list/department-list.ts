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
<<<<<<< HEAD
import { MessageService } from 'primeng/api';
=======
import { ConfirmationService, MessageService } from 'primeng/api';
>>>>>>> d02cfac (Merge pull request #6 from randafci/Esraa/OnTimeFront)
import { Department } from '@/interfaces/department.interface';
import { DepartmentService } from '../DepartmentService';
import { ApiResponse } from '@/interfaces/apiResponse.interface';
import { Router, RouterModule } from "@angular/router";
import { DatePipe } from '@angular/common';
<<<<<<< HEAD
=======
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { TranslationService } from '@/pages/translation-manager/translation-manager/translation.service';
>>>>>>> d02cfac (Merge pull request #6 from randafci/Esraa/OnTimeFront)

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
<<<<<<< HEAD
    DatePipe
  ],
  providers: [MessageService],
=======
    DatePipe,
    TranslatePipe
  ],
  providers: [MessageService, ConfirmationService],
>>>>>>> d02cfac (Merge pull request #6 from randafci/Esraa/OnTimeFront)
  templateUrl: './department-list.html',
  styleUrl: './department-list.scss'
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  loading: boolean = true;
<<<<<<< HEAD
  statuses: any[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

=======
  // statuses: any[] = [
  //   { label: 'Active', value: 'active' },
  //   { label: 'Inactive', value: 'inactive' }
  // ];

  statuses: any[] = []; // Will be populated from translations
>>>>>>> d02cfac (Merge pull request #6 from randafci/Esraa/OnTimeFront)
  integrationOptions: any[] = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];

  activityValues: number[] = [0, 100];

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

<<<<<<< HEAD
  constructor(
    private departmentService: DepartmentService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
=======
  // Store the current translations
  private translations: any = {};

  constructor(
    private departmentService: DepartmentService,
    private messageService: MessageService,
    private router: Router,
    private translationService: TranslationService, // Inject the service
    private confirmationService: ConfirmationService // Inject ConfirmationService
  ) {}

  ngOnInit() {
    // Subscribe to translation changes to build dynamic arrays
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
      this.statuses = [
        { label: translations.departmentList?.statusValues?.active || 'Active', value: 'active' },
        { label: translations.departmentList?.statusValues?.inactive || 'Inactive', value: 'inactive' }
      ];
    });

>>>>>>> d02cfac (Merge pull request #6 from randafci/Esraa/OnTimeFront)
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
<<<<<<< HEAD
            summary: 'Error',
            detail: response.message || 'Failed to load departments'
=======
            summary: this.translations.common?.error || 'Error',
            detail: response.message || this.translations.departmentList?.messages?.loadError
>>>>>>> d02cfac (Merge pull request #6 from randafci/Esraa/OnTimeFront)
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.messageService.add({
          severity: 'error',
<<<<<<< HEAD
          summary: 'Error',
          detail: 'Failed to load departments'
=======
          summary: this.translations.common?.error || 'Error',
          detail: this.translations.departmentList?.messages?.loadError
>>>>>>> d02cfac (Merge pull request #6 from randafci/Esraa/OnTimeFront)
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
<<<<<<< HEAD
    console.log('Deleting department:', department);
    this.messageService.add({
      severity: 'warn',
      summary: 'Delete',
      detail: `Are you sure you want to delete ${department.name}?`,
      life: 3000
=======
    const message = (this.translations.departmentList?.messages?.deleteConfirm || '')
                    .replace('${name}', department.name);

    this.confirmationService.confirm({
      message: message,
      header: this.translations.departmentList?.messages?.deleteHeader || 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Implement actual delete logic here if needed
        console.log('Deleting department:', department);
      }
>>>>>>> d02cfac (Merge pull request #6 from randafci/Esraa/OnTimeFront)
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
