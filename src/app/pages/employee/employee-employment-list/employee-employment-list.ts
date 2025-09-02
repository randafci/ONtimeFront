import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EmployeeEmployment, CreateEmployeeEmployment } from '@/interfaces/employee-employment.interface';
import { EmployeeEmploymentService } from '../EmployeeEmploymentService';
import { ApiResponse } from '@/core/models/api-response.model';
import { Router, RouterModule, ActivatedRoute } from "@angular/router";
import { LookupService, LookupItem } from './LookupService';

@Component({
  selector: 'app-employee-employment-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    InputTextModule,
    TagModule,
    ButtonModule,
    InputIconModule,
    IconFieldModule,
    SelectModule,
    ToastModule,
    RouterModule,
    ConfirmDialogModule,
    TooltipModule,
    DialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './employee-employment-list.html',
  styleUrl: './employee-employment-list.scss'
})
export class EmployeeEmploymentListComponent implements OnInit {
  employments: EmployeeEmployment[] = [];
  loading: boolean = true;
  employeeId: number = 0;
  employeeName: string = '';
  
  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  employmentForm: FormGroup;
  
  companies: LookupItem[] = [];
  departments: LookupItem[] = [];
  allDepartments: LookupItem[] = [];
  
  statusOptions: any[] = [
    { label: 'Current', value: 1 },
    { label: 'Previous', value: 0 }
  ];

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private employeeEmploymentService: EmployeeEmploymentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private lookupService: LookupService
  ) {
    this.employmentForm = this.createForm();
  }

  ngOnInit() {
    this.employeeId = Number(this.route.snapshot.params['employeeId']);
    this.employeeName = this.route.snapshot.params['employeeName'] || 'Employee';
    
    if (this.employeeId) {
      this.loadEmployments();
      this.loadCompanies();
      this.loadAllDepartments();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      employeeId: [this.employeeId, [Validators.required]],
      companyId: [null, [Validators.required]],
      departmentId: [null, [Validators.required]],
      sectionId: [null],
      designationId: [null],
      gradeId: [null],
      isSpecialNeeds: [false],
      joinDate: [null],
      relieveDate: [null],
      showInReport: [true],
      showInDashboard: [true]
    });
  }

  loadEmployments() {
    console.log('Loading employments for employee:', this.employeeId);
    this.loading = true;
    this.employeeEmploymentService.getEmployeeEmploymentsByEmployeeId(this.employeeId).subscribe({
      next: (response: ApiResponse<EmployeeEmployment[]>) => {
        if (response.succeeded) {
          console.log('Employments loaded successfully:', response.data.length, 'employments');
          this.employments = response.data;
        } else {
          console.error('Failed to load employments:', response.message);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load employments'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employments:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load employments'
        });
        this.loading = false;
      }
    });
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.employmentForm.reset();
    this.employmentForm.patchValue({
      employeeId: this.employeeId,
      showInReport: true,
      showInDashboard: true
    });
    this.dialogVisible = true;
  }

  openEditDialog(employment: EmployeeEmployment) {
    this.isEditMode = true;
    
    // Load departments for the selected company first
    if (employment.companyId) {
      this.onCompanyChange(employment.companyId);
    }
    
    this.employmentForm.patchValue({
      id: employment.id,
      employeeId: employment.employeeId,
      companyId: employment.companyId,
      departmentId: employment.departmentId,
      sectionId: employment.sectionId,
      designationId: employment.designationId,
      gradeId: employment.gradeId,
      isSpecialNeeds: employment.isSpecialNeeds,
      joinDate: employment.joinDate ? employment.joinDate.split('T')[0] : null,
      relieveDate: employment.relieveDate ? employment.relieveDate.split('T')[0] : null,
      showInReport: employment.showInReport,
      showInDashboard: employment.showInDashboard
    });
    this.dialogVisible = true;
  }

  closeDialog() {
    this.dialogVisible = false;
    this.employmentForm.reset();
  }

  onSubmit() {
    if (this.employmentForm.invalid) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Please fill all required fields' 
      });
      return;
    }

    this.loading = true;
    const formData = this.employmentForm.value;

    if (this.isEditMode) {
      // Update employment
      const updateData: EmployeeEmployment = {
        ...formData,
        isCurrent: 0
      };

      this.employeeEmploymentService.updateEmployeeEmployment(updateData).subscribe({
        next: (response: ApiResponse<EmployeeEmployment>) => {
          if (response.succeeded) {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: 'Employment updated successfully' 
            });
            this.closeDialog();
            this.loadEmployments();
          } else {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: response.message || 'Failed to update employment' 
            });
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating employment:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to update employment' 
          });
          this.loading = false;
        }
      });
    } else {
      // Create employment
      const createData: CreateEmployeeEmployment = {
        employeeId: formData.employeeId,
        companyId: formData.companyId,
        departmentId: formData.departmentId,
        sectionId: formData.sectionId,
        designationId: formData.designationId,
        gradeId: formData.gradeId,
        isSpecialNeeds: formData.isSpecialNeeds || false, 
        joinDate: formData.joinDate,
        relieveDate: formData.relieveDate,
        showInReport: formData.showInReport,
        showInDashboard: formData.showInDashboard
      };

      this.employeeEmploymentService.createEmployeeEmployment(createData).subscribe({
        next: (response: ApiResponse<EmployeeEmployment>) => {
          if (response.succeeded) {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: 'Employment created successfully' 
            });
            this.closeDialog();
            this.loadEmployments();
          } else {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: response.message || 'Failed to create employment' 
            });
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating employment:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to create employment' 
          });
          this.loading = false;
        }
      });
    }
  }

  loadCompanies() {
    this.lookupService.getAllCompanies().subscribe({
      next: (response: ApiResponse<LookupItem[]>) => {
        if (response.succeeded) {
          this.companies = response.data;
        } else {
          console.error('Failed to load companies:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading companies:', error);
      }
    });
  }

  loadAllDepartments() {
    this.lookupService.getAllDepartments().subscribe({
      next: (response: ApiResponse<LookupItem[]>) => {
        if (response.succeeded) {
          this.allDepartments = response.data;
        } else {
          console.error('Failed to load departments:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  onCompanyChange(companyId: number) {
    // Reset department selection
    this.employmentForm.patchValue({ departmentId: null });
    this.departments = [];

    if (companyId) {
      this.lookupService.getDepartmentsByCompanyId(companyId).subscribe({
        next: (response: ApiResponse<LookupItem[]>) => {
          if (response.succeeded) {
            this.departments = response.data;
          } else {
            console.error('Failed to load departments for company:', response.message);
          }
        },
        error: (error) => {
          console.error('Error loading departments for company:', error);
        }
      });
    }
  }

  deleteEmployment(employment: EmployeeEmployment) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this employment?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.employeeEmploymentService.deleteEmployeeEmployment(employment.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Employment deleted successfully.'
              });
              this.loadEmployments();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || 'Failed to delete employment'
              });
            }
          },
          error: (error) => {
            console.error('Error deleting employment:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete employment'
            });
          }
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Delete operation cancelled'
        });
      }
    });
  }

  getStatusLabel(isCurrent: number): string {
    return isCurrent === 1 ? 'Current' : 'Previous';
  }

  getSeverity(isCurrent: number) {
    return isCurrent === 1 ? 'success' : 'info';
  }

  navigateBack() {
    this.router.navigate(['/employees']);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }
}
