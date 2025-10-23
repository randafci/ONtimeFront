import { ApiResponse } from '@/core/models/api-response.model';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { Employee } from '@/interfaces/employee.interface';
import { PermissionRequest } from '@/interfaces/permission-request.interface';
import { Workflow } from '@/interfaces/workflow.interface';
import { EmployeeService } from '@/pages/employee/EmployeeService';
import { WorkflowService } from '@/pages/workflow/WorkflowService';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
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
import { TableModule, Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { PermissionRequestService } from '../permission_request.service';

@Component({
  selector: 'app-permission-request-list',
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
  templateUrl: './permission-request-list.html',
  styleUrl: './permission-request-list.scss',
  providers: [MessageService, ConfirmationService]
})
export class PermissionRequestListComponent implements OnInit {
  requests: PermissionRequest[] = [];
  loading = true;  
  uploading = false;
  dialogVisible = false;
  isEditMode = false;
  form: FormGroup;
  employees: Employee[] = [];
  workflows: Workflow[] = [];

  filePreviewUrl: string | null = null;

  // ✅ Dummy permission types
  permissionTypes = [
    { id: 1, name: 'Short Leave' },
    { id: 2, name: 'Full Day Leave' },
    { id: 3, name: 'Official Work Outside' },
    { id: 4, name: 'Medical Appointment' },
    { id: 5, name: 'Emergency Leave' }
  ];

  // ✅ Enum mapping
  approvalStatus = {
    Pending: 1,
    Approved: 2,
    Rejected: 3,
    Returned: 4,
    Cancelled: 5
  };

  statusOptions = [
    { id: 1, name: 'Pending' },
    { id: 2, name: 'Approved' },
    { id: 3, name: 'Rejected' },
    { id: 4, name: 'Returned' },
    { id: 5, name: 'Cancelled' }
  ];

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private service: PermissionRequestService,
    private employee_service: EmployeeService,
    private workflow_service: WorkflowService,
    private msg: MessageService,
    private confirm: ConfirmationService
  ) {
    this.form = this.fb.group({
      id: [null],
      employeeEmploymentId: [null, Validators.required],
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      fromTime: [null],
      toTime: [null],
      requestDate: [new Date(), Validators.required],
      comments: [null],
      status: [this.approvalStatus.Pending],
      permissionTypeId: [null, Validators.required],
      permissionRequestType: [null],
      attachmentURL: [null],
      workflowId: [null, Validators.required],
      isDelete: [false],
      fromIntegration: [false],
      employeeName: [null],
      workflowName: [null]
    });
  }

  ngOnInit() {
    this.loadData();
    this.employee_service.getAllEmployees().subscribe(res => (this.employees = res.data || []));
    this.workflow_service.getAllWorkflows().subscribe(res => (this.workflows = res.data || []));
  }

  loadData() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (res: ApiResponse<PermissionRequest[]>) => {
        this.requests = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to load permission requests.' });
        this.loading = false;
      }
    });
  }

  getSeverity(status: number) {
    if (!status) return 'info';
    switch (status) {
      case 1: return 'info'; // Pending
      case 2: return 'success'; // Approved
      case 3: return 'danger'; // Rejected
      case 4: return 'warning'; // Returned
      case 5: return 'danger'; // Cancelled
      default: return 'secondary';
    }
  }

  getStatusName(status: number): string {
    const found = this.statusOptions.find(s => s.id === status);
    return found ? found.name : 'Unknown';
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.filePreviewUrl = null;
    this.form.reset({
      status: this.approvalStatus.Pending,
      requestDate: new Date(),
      isDelete: false,
      fromIntegration: false
    });
    this.dialogVisible = true;
  }

  openEditDialog(item: PermissionRequest) {
    this.isEditMode = true;
    this.filePreviewUrl = item.attachmentURL || null;

    this.form.patchValue({
      ...item,
      fromDate: item.fromDate ? new Date(item.fromDate) : null,
      toDate: item.toDate ? new Date(item.toDate) : null,
      requestDate: item.requestDate ? new Date(item.requestDate) : new Date()
    });

    this.dialogVisible = true;
  }

  closeDialog() {
    this.dialogVisible = false;
    this.filePreviewUrl = null;
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;

    const dto = { ...this.form.value };

    dto.fromDate = dto.fromDate ? new Date(dto.fromDate).toISOString() : null;
    dto.toDate = dto.toDate ? new Date(dto.toDate).toISOString() : null;
    dto.requestDate = dto.requestDate ? new Date(dto.requestDate).toISOString() : null;

    if (!this.isEditMode) delete dto.id;

    const request$ = this.isEditMode
      ? this.service.update(dto.id, dto)
      : this.service.create(dto);

    request$.subscribe({
      next: () => {
        this.msg.add({
          severity: 'success',
          summary: this.isEditMode ? 'Updated' : 'Created',
          detail: `Permission request ${this.isEditMode ? 'updated' : 'created'} successfully.`
        });
        this.closeDialog();
        this.loadData();
        this.loading = false;
      },
      error: (err) => {
        console.error('Permission request failed', err);
        this.msg.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.title || 'Operation failed.'
        });
        this.loading = false;
      }
    });
  }

  delete(item: PermissionRequest) {
    this.confirm.confirm({
      message: `Are you sure you want to delete request #${item.id}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.service.delete(item.id!).subscribe({
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.uploading = true;
    this.service.uploadFile(file).subscribe({
      next: (res) => {
        this.uploading = false;
        if (res.succeeded && res.data) {
          this.msg.add({ severity: 'success', summary: 'Uploaded', detail: 'File uploaded successfully!' });
          this.filePreviewUrl = res.data;
          this.form.patchValue({ attachmentURL: res.data });

          
        } else {
          this.msg.add({ severity: 'warn', summary: 'Upload Failed', detail: res.message || 'Failed to upload file' });
        }
      },
      error: (err) => {
        this.uploading = false;
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'File upload failed!' });
        console.error(err);
      }
    });
  }

  // ✅ Helper: check if URL is image
  isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }
}
