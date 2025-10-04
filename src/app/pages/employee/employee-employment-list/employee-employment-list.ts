import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from "@angular/router";
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EmployeeEmployment, CreateEmployeeEmployment } from '@/interfaces/employee-employment.interface';
import { EmployeeEmploymentService } from '../EmployeeEmploymentService';
import { ApiResponse } from '@/core/models/api-response.model';
import { LookupService, LookupItem } from './LookupService';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';

@Component({
  selector: 'app-employee-employment-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, TableModule, InputTextModule, TagModule,
    ButtonModule, InputIconModule, IconFieldModule, SelectModule, ToastModule,
    RouterModule, ConfirmDialogModule, TooltipModule, DialogModule, TranslatePipe
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
  sections: LookupItem[] = [];
  designations: LookupItem[] = [];
  statusOptions: any[] = [];
  private translations: any = {};

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private employeeEmploymentService: EmployeeEmploymentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private lookupService: LookupService,
    private translationService: TranslationService
  ) {
    this.employmentForm = this.createForm();
  }

  ngOnInit() {
    this.translationService.translations$.subscribe(trans => {
      this.translations = trans;
      this.initializeTranslatedArrays();
    });

    this.employeeId = Number(this.route.snapshot.params['employeeId']);
    this.employeeName = this.route.snapshot.params['employeeName'] || 'Employee';
    
    if (this.employeeId) {
      this.loadEmployments();
      this.loadLookups();
    }
  }

  initializeTranslatedArrays(): void {
    const statusTrans = this.translations.employments?.listPage?.statuses || {};
    this.statusOptions = [
      { label: statusTrans.current || 'Current', value: 1 },
      { label: statusTrans.previous || 'Previous', value: 0 }
    ];
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
    this.loading = true;
    this.employeeEmploymentService.getEmployeeEmploymentsByEmployeeId(this.employeeId).subscribe({
      next: (response: ApiResponse<EmployeeEmployment[]>) => {
        if (response.succeeded) {
          this.employments = response.data;
        } else {
          this.showToast('error', this.translations.common?.error, response.message || this.translations.employments?.listPage?.messages?.loadError);
        }
        this.loading = false;
      },
      error: () => {
        this.showToast('error', this.translations.common?.error, this.translations.employments?.listPage?.messages?.loadError);
        this.loading = false;
      }
    });
  }

  loadLookups(): void {
    this.lookupService.getAllCompanies().subscribe(res => this.companies = res.succeeded ? res.data : []);
    this.lookupService.getAllSections().subscribe(res => this.sections = res.succeeded ? res.data : []);
    this.lookupService.getAllDesignations().subscribe(res => this.designations = res.succeeded ? res.data : []);
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.employmentForm.reset({
      employeeId: this.employeeId,
      showInReport: true,
      showInDashboard: true
    });
    this.dialogVisible = true;
  }

  openEditDialog(employment: EmployeeEmployment) {
    this.isEditMode = true;
    if (employment.companyId) {
      this.onCompanyChange(employment.companyId);
    }
    this.employmentForm.patchValue({
      ...employment,
      joinDate: employment.joinDate ? employment.joinDate.split('T')[0] : null,
      relieveDate: employment.relieveDate ? employment.relieveDate.split('T')[0] : null,
    });
    this.dialogVisible = true;
  }

  closeDialog() {
    this.dialogVisible = false;
  }

  onSubmit() {
    if (this.employmentForm.invalid) {
      this.showToast('error', this.translations.common?.error, this.translations.employments?.formPage?.validation?.fillRequired);
      return;
    }
    this.loading = true;
    const formData = this.employmentForm.value;
    
    const employmentData: CreateEmployeeEmployment = {
      employeeId: parseInt(formData.employeeId),
      companyId: parseInt(formData.companyId),
      departmentId: parseInt(formData.departmentId),
      sectionId: formData.sectionId ? parseInt(formData.sectionId) : null,
      designationId: formData.designationId ? parseInt(formData.designationId) : null,
      gradeId: formData.gradeId ? parseInt(formData.gradeId) : null,
      isSpecialNeeds: formData.isSpecialNeeds || false,
      isCurrent: 1,
      joinDate: formData.joinDate,
      relieveDate: formData.relieveDate
    };
    
    if (this.isEditMode) {
      const updateData: EmployeeEmployment = {
        ...employmentData,
        id: parseInt(formData.id),
        isCurrent: 0, // For updates, keep existing isCurrent value
        showInReport: formData.showInReport || false,
        showInDashboard: formData.showInDashboard || false
      };
      this.employeeEmploymentService.updateEmployeeEmployment(updateData).subscribe(this.getObserver('update'));
    } else {
      this.employeeEmploymentService.createEmployeeEmployment(employmentData).subscribe(this.getObserver('create'));
    }
  }

  private getObserver(action: 'create' | 'update') {
    const toasts = this.translations.employments?.formPage?.toasts || {};
    const successKey = action === 'create' ? 'createSuccess' : 'updateSuccess';
    const errorKey = action === 'create' ? 'createError' : 'updateError';

    return {
      next: (response: ApiResponse<EmployeeEmployment>) => {
        if (response.succeeded) {
          this.showToast('success', this.translations.common?.success, toasts[successKey]);
          this.closeDialog();
          this.loadEmployments();
        } else {
          this.showToast('error', this.translations.common?.error, response.message || toasts[errorKey]);
        }
        this.loading = false;
      },
      error: () => {
        this.showToast('error', this.translations.common?.error, toasts[errorKey]);
        this.loading = false;
      }
    };
  }

  onCompanyChange(companyId: number) {
    this.employmentForm.patchValue({ departmentId: null });
    this.departments = [];
    if (companyId) {
      this.lookupService.getDepartmentsByCompanyId(companyId).subscribe(res => this.departments = res.succeeded ? res.data : []);
    }
  }

  deleteEmployment(employment: EmployeeEmployment) {
    const trans = this.translations.employments?.listPage?.messages || {};
    const commonTrans = this.translations.common || {};
    this.confirmationService.confirm({
      message: trans.deleteConfirm,
      header: commonTrans.confirmDelete,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: commonTrans.yes,
      rejectLabel: commonTrans.no,
      accept: () => {
        this.employeeEmploymentService.deleteEmployeeEmployment(employment.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.showToast('success', commonTrans.success, trans.deleteSuccess);
              this.loadEmployments();
            } else {
              this.showToast('error', commonTrans.error, response.message || trans.deleteError);
            }
          },
          error: () => this.showToast('error', commonTrans.error, trans.deleteError)
        });
      },
      reject: () => {
        this.showToast('info', trans.cancelled, trans.deleteCancelled);
      }
    });
  }

  getStatusLabel(isCurrent: number): string {
    const status = this.statusOptions.find(s => s.value === isCurrent);
    return status ? status.label : '';
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

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}