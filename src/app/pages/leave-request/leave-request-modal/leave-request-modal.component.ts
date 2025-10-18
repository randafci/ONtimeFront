import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LeaveRequest, CreateLeaveRequest, UpdateLeaveRequest } from '../../../interfaces/leave-request.interface';
import { EmployeeEmployment } from '../../../interfaces/employee-employment.interface';
import { LeaveType } from '../../../interfaces/leave-type.interface';
import { Workflow } from '../../../interfaces/workflow.interface';
import { LeaveRequestService } from '../LeaveRequestService';
import { ApiResponse } from '../../../core/models/api-response.model';
// import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
// import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-leave-request-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    FileUploadModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './leave-request-modal.component.html'
})
export class LeaveRequestModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() leaveRequest: LeaveRequest | null = null;
  @Input() employeeEmployments: EmployeeEmployment[] = [];
  @Input() leaveTypes: LeaveType[] = [];
  @Input() workflows: Workflow[] = [];
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<LeaveRequest>();
  @Output() onCancelEvent = new EventEmitter<void>();

  leaveRequestForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private leaveRequestService: LeaveRequestService,
    private messageService: MessageService
  ) {
    this.leaveRequestForm = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      comments: [''],
      leaveTypeId: ['', Validators.required],
      employeeEmploymentId: [''],
      attachmentURL: [''],
      workflowId: ['']
    });
  }

  ngOnInit() {
    // Watch for date changes to calculate number of days
    this.leaveRequestForm.get('fromDate')?.valueChanges.subscribe(() => {
      this.calculateNumberOfDays();
    });

    this.leaveRequestForm.get('toDate')?.valueChanges.subscribe(() => {
      this.calculateNumberOfDays();
    });
  }

  ngOnChanges() {
    if (this.dialogVisible && this.leaveRequest) {
      this.loadLeaveRequestData();
    } else if (this.dialogVisible && !this.isEditMode) {
      this.resetForm();
    }
  }

  loadLeaveRequestData(): void {
    if (this.leaveRequest) {
      this.leaveRequestForm.patchValue({
        fromDate: this.formatDateForInput(new Date(this.leaveRequest.fromDate)),
        toDate: this.formatDateForInput(new Date(this.leaveRequest.toDate)),
        comments: this.leaveRequest.comments || '',
        leaveTypeId: this.leaveRequest.leaveTypeId,
        employeeEmploymentId: this.leaveRequest.employeeEmploymentId || null,
        attachmentURL: this.leaveRequest.attachmentURL || '',
        workflowId: this.leaveRequest.workflowId || null
      });
    }
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  resetForm(): void {
    this.leaveRequestForm.reset();
    this.selectedFile = null;
  }

  onFileSelected(event: any): void {
    const file = event.files[0];
    if (file) {
      this.selectedFile = file;
      this.showToast('success', 'Success', `File "${file.name}" selected successfully`);
    }
  }

  onFileRemoved(event: any): void {
    this.selectedFile = null;
    this.showToast('info', 'Info', 'File removed');
  }

  private calculateNumberOfDays() {
    const fromDate = this.leaveRequestForm.get('fromDate')?.value;
    const toDate = this.leaveRequestForm.get('toDate')?.value;
    
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const timeDiff = to.getTime() - from.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      return daysDiff;
    }
    return 0;
  }

  get numberOfDays(): number {
    return this.calculateNumberOfDays();
  }

  onDialogHide(): void {
    this.closeDialog();
  }

  closeDialog(): void {
    this.selectedFile = null;
    this.dialogVisibleChange.emit(false);
  }

  onCancel(): void {
    this.closeDialog();
    this.onCancelEvent.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) this.markFormGroupTouched(control);
    });
  }

  onSubmit(): void {
    if (this.leaveRequestForm.invalid) {
      this.markFormGroupTouched(this.leaveRequestForm);
      return;
    }

    const formData = this.leaveRequestForm.value;
    
    // Validate dates
    if (formData.fromDate >= formData.toDate) {
      this.showToast('error', 'Error', 'From date must be before to date');
      return;
    }

    // Handle file upload - for now, just store the filename
    // In a real application, you would upload the file to a server and get the URL
    let attachmentURL = formData.attachmentURL;
    if (this.selectedFile) {
      attachmentURL = this.selectedFile.name; // In production, this would be the uploaded file URL
    }

    const data = {
      ...formData,
      fromDate: new Date(formData.fromDate).toISOString(),
      toDate: new Date(formData.toDate).toISOString(),
      attachmentURL: attachmentURL
    };

    if (this.isEditMode) {
      this.updateLeaveRequest(data);
    } else {
      this.createLeaveRequest(data);
    }
  }

  createLeaveRequest(data: CreateLeaveRequest): void {
    this.leaveRequestService.createLeaveRequest(data).subscribe({
      next: (response: ApiResponse<LeaveRequest>) => this.handleSuccess(response, 'createSuccess'),
      error: () => this.handleError('createError')
    });
  }

  updateLeaveRequest(data: UpdateLeaveRequest): void {
    this.leaveRequestService.updateLeaveRequest(this.leaveRequest!.id, data).subscribe({
      next: (response: ApiResponse<LeaveRequest>) => this.handleSuccess(response, 'updateSuccess'),
      error: () => this.handleError('updateError')
    });
  }

  private handleSuccess(response: ApiResponse<LeaveRequest>, messageKey: string): void {
    const message = messageKey === 'createSuccess' ? 'Leave request created successfully' : 'Leave request updated successfully';
    this.showToast('success', 'Success', message);
    this.onSave.emit(response.data);
    this.closeDialog();
  }

  private handleError(messageKey: string): void {
    const message = messageKey === 'createError' ? 'Failed to create leave request' : 'Failed to update leave request';
    this.showToast('error', 'Error', message);
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}
