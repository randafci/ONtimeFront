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
import { EmployeeShiftAssignment, CreateEmployeeShiftAssignment, Shift } from '@/interfaces/employee-shift-assignment.interface';
import { EmployeeShiftAssignmentService } from '../EmployeeShiftAssignmentService';
import { ApiResponse } from '@/core/models/api-response.model';
import { Router, RouterModule, ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-employee-shift-assignment',
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
  templateUrl: './employee-shift-assignment.html',
  styleUrl: './employee-shift-assignment.scss'
})
export class EmployeeShiftAssignmentComponent implements OnInit {
  shiftAssignments: EmployeeShiftAssignment[] = [];
  loading: boolean = true;
  employeeId: number = 0;
  employeeName: string = '';
  
  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  assignmentForm: FormGroup;
  
  shifts: Shift[] = [];
  selectedDays: string[] = [];
  selectedFileName: string = '';
  selectedFile: File | null = null;
  
  weekdays = [
    { label: 'Sun', value: 'Sunday' },
    { label: 'Mon', value: 'Monday' },
    { label: 'Tue', value: 'Tuesday' },
    { label: 'Wed', value: 'Wednesday' },
    { label: 'Thu', value: 'Thursday' },
    { label: 'Fri', value: 'Friday' },
    { label: 'Sat', value: 'Saturday' }
  ];
  
  statusOptions: any[] = [
    { label: 'Current', value: true },
    { label: 'Previous', value: false }
  ];

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private employeeShiftAssignmentService: EmployeeShiftAssignmentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.assignmentForm = this.createForm();
  }

  ngOnInit() {
    this.employeeId = Number(this.route.snapshot.params['employeeId']);
    this.employeeName = this.route.snapshot.params['employeeName'] || 'Employee';
    
    if (this.employeeId) {
      this.loadShifts();
    }

    // Subscribe to priority changes to update form validation
    this.assignmentForm.get('priority')?.valueChanges.subscribe(priority => {
      this.onPriorityChange(priority);
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      employeeId: [this.employeeId, [Validators.required]],
      shiftId: [null, [Validators.required]],
      startDateTime: [null, [Validators.required]],
      endDateTime: [null], // Will be conditionally required
      priority: ['0', [Validators.required]], // 0 = Temporary, 1 = Permanent
      isOtShift: [false],
      isOverwriteHolidays: [false],
      isPunchNotRequired: [false],
      attachmentURL: ['']
    });
  }

  loadShiftAssignments() {
    this.loading = true;
    this.employeeShiftAssignmentService.getEmployeeShiftAssignmentsByEmployeeId(this.employeeId).subscribe({
      next: (response: ApiResponse<EmployeeShiftAssignment[]>) => {
        if (response.succeeded) {
          this.shiftAssignments = response.data.filter(assignment => assignment.employeeId === this.employeeId);
          
          // Populate shift names by matching with loaded shifts
          this.shiftAssignments.forEach(assignment => {
            const matchingShift = this.shifts.find(shift => shift.id === assignment.shiftId);
            if (matchingShift) {
              assignment.shift = {
                id: matchingShift.id,
                name: matchingShift.name,
                startTime: '00:00:00',
                endTime: '00:00:00'
              };
            }
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load shift assignments'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load shift assignments'
        });
        this.loading = false;
      }
    });
  }

  loadShifts() {
    this.employeeShiftAssignmentService.getAllShifts().subscribe({
      next: (response: ApiResponse<Shift[]>) => {
        if (response.succeeded) {
          this.shifts = response.data.filter(shift => !shift.isDeleted);
          this.loadShiftAssignments();
        }
      },
      error: (error) => {
        console.error('Error loading shifts:', error);
      }
    });
  }

  onPriorityChange(priority: string) {
    const endDateTimeControl = this.assignmentForm.get('endDateTime');
    if (priority === '0') { 
      endDateTimeControl?.setValidators([Validators.required]);
    } else {  
      endDateTimeControl?.clearValidators();   
      endDateTimeControl?.setValue(null);
    }   
    endDateTimeControl?.updateValueAndValidity();
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.assignmentForm.reset();
    this.selectedDays = [];
    this.selectedFileName = '';
    this.selectedFile = null;
    this.assignmentForm.patchValue({
      employeeId: this.employeeId,
      priority: '0' // Default to Temporary
    });
    this.dialogVisible = true;
  }

  openEditDialog(assignment: EmployeeShiftAssignment) {
    this.isEditMode = true;
    
    const weekdayMapping: { [key: number]: string } = {
      0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday',
      4: 'Thursday', 5: 'Friday', 6: 'Saturday'
    };
    
    this.selectedDays = assignment.weekdays 
      ? assignment.weekdays.map(dayNum => weekdayMapping[dayNum as number] || '').filter(day => day !== '')
      : [];
    
    this.selectedFileName = assignment.attachmentURL ? 'File attached' : '';
    this.selectedFile = null;
    
    const priorityValue = assignment.priority?.toString() || '0';
    
    this.assignmentForm.patchValue({
      id: assignment.id,
      employeeId: assignment.employeeId,
      shiftId: assignment.shiftId,
      startDateTime: assignment.startDateTime ? assignment.startDateTime.split('T')[0] : null,
      endDateTime: assignment.endDateTime ? assignment.endDateTime.split('T')[0] : null,
      priority: priorityValue,
      isOtShift: assignment.isOtShift,
      isOverwriteHolidays: assignment.isOverwriteHolidays,
      isPunchNotRequired: assignment.isPunchNotRequired,
      attachmentURL: assignment.attachmentURL
    });
    
    this.onPriorityChange(priorityValue);
    this.dialogVisible = true;
  }

  closeDialog() {
    this.dialogVisible = false;
    this.assignmentForm.reset();
    this.selectedDays = [];
    this.selectedFileName = '';
    this.selectedFile = null;
  }

  onDayChange(event: any) {
    const day = event.target.value;
    if (event.target.checked) {
      if (!this.selectedDays.includes(day)) {
        this.selectedDays.push(day);
      }
    } else {
      this.selectedDays = this.selectedDays.filter(d => d !== day);
    }
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }

  onSubmit() {
    if (this.assignmentForm.invalid) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Please fill all required fields' 
      });
      return;
    }

    this.loading = true;
    const formData = this.assignmentForm.value;

    // Handle file upload if file is selected
    if (this.selectedFile) {
      this.employeeShiftAssignmentService.uploadShiftFile(this.selectedFile).subscribe({
        next: (response: ApiResponse<string>) => {
          if (response.succeeded) {
            formData.attachmentURL = response.data;
            this.createOrUpdateAssignment(formData);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to upload file'
            });
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error uploading file:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to upload file'
          });
          this.loading = false;
        }
      });
    } else {
      this.createOrUpdateAssignment(formData);
    }
  }

  private createOrUpdateAssignment(formData: any) {
    const weekdayMapping: { [key: string]: number } = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };

    const selectedShift = this.shifts.find(shift => shift.id === formData.shiftId);
    const shiftName = selectedShift?.name?.trim() || '';
    
    if (!shiftName) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Shift name not found. Please refresh and try again.' 
      });
      return;
    }

    const assignmentData: CreateEmployeeShiftAssignment = {
      employeeId: parseInt(formData.employeeId),
      shiftId: parseInt(formData.shiftId),
      shiftName: shiftName,
      startDateTime: formData.startDateTime + 'T00:00:00',
      endDateTime: formData.endDateTime ? formData.endDateTime + 'T23:59:59' : null,
      priority: parseInt(formData.priority),
      isOtShift: formData.isOtShift || false,
      isOverwriteHolidays: formData.isOverwriteHolidays || false,
      isPunchNotRequired: formData.isPunchNotRequired || false,
      isCurrent: true,
      attachmentURL: formData.attachmentURL || null,
      weekdays: this.selectedDays.length > 0 ? this.selectedDays.map(day => weekdayMapping[day]) : []
    };

    if (this.isEditMode) {
      // Update assignment
      this.employeeShiftAssignmentService.updateEmployeeShiftAssignment(formData.id, assignmentData).subscribe({
        next: (response: ApiResponse<EmployeeShiftAssignment>) => {
          if (response.succeeded) {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: 'Shift assignment updated successfully' 
            });
            this.closeDialog();
            this.loadShiftAssignments();
          } else {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: response.message || 'Failed to update shift assignment' 
            });
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating shift assignment:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to update shift assignment' 
          });
          this.loading = false;
        }
      });
    } else {
      // Create assignment
      this.employeeShiftAssignmentService.createEmployeeShiftAssignment(assignmentData).subscribe({
        next: (response: ApiResponse<EmployeeShiftAssignment>) => {
          if (response.succeeded) {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: 'Shift assignment created successfully' 
            });
            this.closeDialog();
            this.loadShiftAssignments();
          } else {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: response.message || 'Failed to create shift assignment' 
            });
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating shift assignment:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to create shift assignment' 
          });
          this.loading = false;
        }
      });
    }
  }

  deleteAssignment(assignment: EmployeeShiftAssignment) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this shift assignment?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.employeeShiftAssignmentService.deleteEmployeeShiftAssignment(assignment.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Shift assignment deleted successfully.'
              });
              this.loadShiftAssignments();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || 'Failed to delete shift assignment'
              });
            }
          },
          error: (error) => {
            console.error('Error deleting shift assignment:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete shift assignment'
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

  getStatusLabel(isCurrent: boolean): string {
    return isCurrent ? 'Current' : 'Previous';
  }

  getSeverity(isCurrent: boolean) {
    return isCurrent ? 'success' : 'info';
  }

  getPrioritySeverity(priority: string | number) {
    const priorityValue = typeof priority === 'string' ? priority : priority.toString();
    return priorityValue === '1' ? 'success' : 'warning';
  }

  getPriorityLabel(priority: string | number) {
    const priorityValue = typeof priority === 'string' ? priority : priority.toString();
    return priorityValue === '1' ? 'Permanent' : 'Temporary';
  }

  navigateBack() {
    // Navigate back to the employee edit page with the "Assign Schedule" tab active (tab index 5)
    // Manually encrypt the tab value using the same method as the tab persistence service
    const encryptionKey = 'OnTimeApp2024';
    let encrypted = '';
    const tabValue = '5';
    for (let i = 0; i < tabValue.length; i++) {
      const charCode = tabValue.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length);
      encrypted += String.fromCharCode(charCode);
    }
    const encryptedTab = btoa(encrypted);
    
    this.router.navigate(['/employees/edit', this.employeeId], { 
      queryParams: { tab: encryptedTab }
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
