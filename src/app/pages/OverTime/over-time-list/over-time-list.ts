import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { OverTimeRequest } from '@/interfaces/overTime.interface';
import { ApiResponse } from '@/core/models/api-response.model';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { OverTimeRequestService } from '../overTime.service';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { Employee } from '@/interfaces/employee.interface';
import { Workflow } from '@/interfaces/workflow.interface';
import { EmployeeService } from '@/pages/employee/EmployeeService';
import { WorkflowService } from '@/pages/workflow/workflow.service';

@Component({
  selector: 'app-over-time-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    ConfirmDialogModule,
    DialogModule,
    RouterModule,
    DatePipe,
    TranslatePipe
  ],
  templateUrl: './over-time-list.html',
  styleUrls: ['./over-time-list.scss'],
  providers: [MessageService, ConfirmationService]
})
export class OverTimeListComponent implements OnInit {
  requests: OverTimeRequest[] = [];
  loading = true;
  dialogVisible = false;
  isEditMode = false;
  form: FormGroup;
  employees: Employee[] = [];
  workflows: Workflow[] = [];

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private service: OverTimeRequestService,
    private employee_service: EmployeeService,
    private workflow_service: WorkflowService,
    private msg: MessageService,
    private confirm: ConfirmationService
  ) {
    this.form = this.fb.group({
      id: [null],
      employeeEmploymentId: [null, Validators.required],
      overTimeHours: [null, [Validators.required, Validators.min(0.5)]],
      requestDate: [null, Validators.required],
      punchDate: [null],
      status: ['Pending'],
      aOverTimeHours: [null],
      allowedOvertimeHours: [null],
      approvedOvertimeHours: [null],
      workflowId: [null],
      employeeName: [null],
      workflowName: [null]
    });
  }

  ngOnInit() {
    this.loadData();
    this.employee_service.getAllEmployees().subscribe(res => (this.employees = res.data || []));
    this.workflow_service.getAllList().subscribe(res => (this.workflows = res.data || []));
  }

  loadData() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (res: ApiResponse<OverTimeRequest[]>) => {
        this.requests = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to load overtime requests.' });
        this.loading = false;
      }
    });
  }

  getSeverity(status: string) {
    if (!status) return 'info';
    switch (status.toLowerCase()) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'info';
    }
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.form.reset({ status: 'Pending' });
    this.dialogVisible = true;
  }

  openEditDialog(item: OverTimeRequest) {
    this.isEditMode = true;
    this.form.patchValue({
      ...item,
      requestDate: item.requestDate ? new Date(item.requestDate) : null,
      punchDate: item.punchDate ? new Date(item.punchDate) : null
    });
    this.dialogVisible = true;
  }

  closeDialog() {
    this.dialogVisible = false;
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    const dto = { ...this.form.value };

    dto.requestDate = dto.requestDate ? new Date(dto.requestDate).toISOString() : null;
    dto.punchDate = dto.punchDate ? new Date(dto.punchDate).toISOString() : null;

    // Fix: convert 0 values to null
    if (dto.workflowId === 0) dto.workflowId = null;
    if (dto.employeeEmploymentId === 0) dto.employeeEmploymentId = null;

    if (!this.isEditMode) delete dto.id;

    const request$ = this.isEditMode
      ? this.service.update(dto.id, dto)
      : this.service.create(dto);

    request$.subscribe({
      next: () => {
        this.msg.add({
          severity: 'success',
          summary: this.isEditMode ? 'Updated' : 'Created',
          detail: `Overtime request ${this.isEditMode ? 'updated' : 'created'} successfully.`
        });
        this.closeDialog();
        this.loadData();
        this.loading = false;
      },
      error: (err) => {
        console.error('Overtime request failed', err);
        this.msg.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.title || 'Operation failed.'
        });
        this.loading = false;
      }
    });
  }

  delete(item: OverTimeRequest) {
    this.confirm.confirm({
      message: `Are you sure you want to delete request #${item.id}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.service.delete(item.id).subscribe({
          next: () => {
            this.msg.add({ severity: 'success', summary: 'Deleted', detail: 'Request deleted successfully.' });
            this.loadData();
          },
          error: () => {
            this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete request.' });
          }
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
