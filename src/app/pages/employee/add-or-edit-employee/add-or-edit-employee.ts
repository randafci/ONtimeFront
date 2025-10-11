import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';

import { MessageService, ConfirmationService } from 'primeng/api';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Employee, CreateEmployee, EditEmployee } from '../../../interfaces/employee.interface';
import { EmployeeService } from '../EmployeeService';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { TabPersistenceService } from '../../../core/services/tab-persistence.service';
import { TAB_CONFIGS } from '../../../core/constants/tab-configs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmployeeShiftAssignment } from '../../../interfaces/employee-shift-assignment.interface';
import { EmployeeShiftAssignmentService } from '../EmployeeShiftAssignmentService';

@Component({
  selector: 'app-add-or-edit-employee',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    ToastModule,
    SelectModule,
    TableModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    DialogModule,
    RouterModule,
    TranslatePipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './add-or-edit-employee.html',
  styleUrl: './add-or-edit-employee.scss'
})
export class AddEditEmployeeComponent implements OnInit, OnDestroy {
  employeeForm: FormGroup;
  isEditMode = false;
  employeeId: number | null = null;
  loading = false;
  submitted = false;
  activeTabIndex = 0;
  profileImageUrl: string | null = null;

  // Dropdown options
  genderOptions: any[] = [];
  employeeStatusOptions: any[] = [];
  private translations: any = {};
  private destroy$ = new Subject<void>();

  // Shift assignments
  shiftAssignments: EmployeeShiftAssignment[] = [];
  loadingShiftAssignments: boolean = false;
  
  // Shift assignment modal
  shiftAssignmentDialogVisible: boolean = false;
  isEditShiftAssignment: boolean = false;
  shiftAssignmentForm: FormGroup;
  loadingShiftAssignment: boolean = false;
  
  // Delete confirmation
  deleteConfirmationVisible: boolean = false;
  assignmentToDelete: EmployeeShiftAssignment | null = null;
  
  // Shift assignment form data
  shifts: any[] = [];
  selectedDays: string[] = [];
  selectedFileName: string = '';
  selectedFile: File | null = null;
  
  weekdays = [
    { label: 'Sun', value: '0' },
    { label: 'Mon', value: '1' },
    { label: 'Tue', value: '2' },
    { label: 'Wed', value: '3' },
    { label: 'Thu', value: '4' },
    { label: 'Fri', value: '5' },
    { label: 'Sat', value: '6' }
  ];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute,
    private translationService: TranslationService,
    private tabPersistenceService: TabPersistenceService,
    private employeeShiftAssignmentService: EmployeeShiftAssignmentService
  ) {
    this.employeeForm = this.createForm();
    this.shiftAssignmentForm = this.createShiftAssignmentForm();
  }

  ngOnInit() {
    this.translationService.translations$.subscribe(trans => {
      this.translations = trans;
      this.initializeDropdowns(); // Initialize dropdowns when translations load
    });
    this.employeeId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.employeeId;

   
    this.activeTabIndex = this.tabPersistenceService.initializeTabFromUrl(this.route, TAB_CONFIGS.EMPLOYEE_FORM);
    

    this.tabPersistenceService.currentTab$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tabIndex => {
        this.activeTabIndex = tabIndex;
      });

    if (this.isEditMode && this.employeeId) {
      this.loadEmployee(this.employeeId);
      this.loadShiftAssignments();
      this.loadShifts();
    }
  }

  onTabChange(tabIndex: number): void {
    this.tabPersistenceService.changeTab(tabIndex, this.route, TAB_CONFIGS.EMPLOYEE_FORM);
  }

  onNextTab(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.activeTabIndex < 6) {
      this.onTabChange(this.activeTabIndex + 1);
    }
  }

  onPreviousTab(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.activeTabIndex > 0) {
      this.onTabChange(this.activeTabIndex - 1);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  
  getTabName(tabIndex: number): string {
    const tabNames = [
      'general',
      'contact', 
      'organizational',
      'documents',
      'reportManagers',
      'assignSchedule',
      'policies'
    ];
    return tabNames[tabIndex] || 'unknown';
  }
  
 
  private getTranslation(key: string, fallback: string): string {
    const keys = key.split('.');
    let result = this.translations;
    for (const k of keys) {
        result = result?.[k];
        if (result === undefined || result === null) {
            return fallback;
        }
    }
    return result as string || fallback;
  }

  initializeDropdowns(): void {
    const genderTrans = this.translations.employees?.common;
    const statusTrans = this.translations.employees?.listPage?.statuses;

    this.genderOptions = [
      { label: genderTrans?.male || 'Male', value: 'M' },
      { label: genderTrans?.female || 'Female', value: 'F' }
    ];

    if (statusTrans) {
      const statusKeys = ['active', 'inactive', 'onLeave', 'terminated', 'suspended', 'probation'];
      this.employeeStatusOptions = statusKeys.map(key => ({
        label: statusTrans[key] || key,
        value: key
      }));
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      // General Information
      employeeCode: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      nationality: [''],
      religionType: [''],
      isSpecialNeeds: [false],
      employeeType: [''],
      employeeStatus: ['active'],
      
      // Contact Information
      contact: this.fb.group({
        personalEmail: [''],
        officialEmail: [''],
        personalPhone: [''],
        personalMobile: [''],
        officialPhone: [''],
        officialMobile: [''],
        address: [''],
        city: [''],
        state: ['']
      }),

      // Document Information
      document: this.fb.group({
        passportNumber: [''],
        passportExpirationDate: [''],
        visaNumber: [''],
        visaExpirationDate: ['']
      }),

      // Display Settings
      displayInReport: [true],
      displayInReportsDashboard: [true],
      imageUrl: ['']
    });
  }

  createShiftAssignmentForm(): FormGroup {
    return this.fb.group({
      id: [null],
      employeeId: [this.employeeId],
      shiftId: [null, [Validators.required]],
      priority: [null, [Validators.required]],
      startDateTime: [null, [Validators.required]],
      endDateTime: [null],
      isOtShift: [false],
      isOverwriteHolidays: [false],
      isPunchNotRequired: [false],
      attachment: [null]
    });
  }

  loadEmployee(id: number) {
    this.loading = true;
    this.employeeService.getEmployeeById(id).subscribe({
      next: (response: ApiResponse<Employee>) => {
        if (response.succeeded) {
          this.populateForm(response.data);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.getTranslation('employees.formPage.messages.errorSummary', 'Error'),
            detail: response.message || this.getTranslation('employees.formPage.messages.loadError', 'Failed to load employee')
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employee:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.getTranslation('employees.formPage.messages.errorSummary', 'Error'),
          detail: this.getTranslation('employees.formPage.messages.loadError', 'Failed to load employee')
        });
        this.loading = false;
      }
    });
  }

  populateForm(employee: Employee) {
    this.employeeForm.patchValue({
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      gender: employee.gender,
      nationality: employee.nationality,
      religionType: employee.religionType,
      isSpecialNeeds: employee.isSpecialNeeds,
      imageUrl: employee.imageUrl,
      employeeType: employee.employeeType,
      employeeStatus: employee.employeeStatus,
      contact: employee.contact || {},
      document: employee.document || {}
    });
    
    if (employee.imageUrl) {
      if (employee.imageUrl.startsWith('data:') || employee.imageUrl.startsWith('http')) {
        this.profileImageUrl = employee.imageUrl;
      } else {
        this.profileImageUrl = null;
      }
    } else {
      this.profileImageUrl = null;
    }
  }

  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'error',
          summary: this.getTranslation('employees.formPage.messages.errorSummary', 'Error'),
          detail: this.getTranslation('employees.formPage.messages.invalidFile', 'Please select an image file')
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: this.getTranslation('employees.formPage.messages.errorSummary', 'Error'),
          detail: this.getTranslation('employees.formPage.messages.fileTooLarge', 'Image size should be less than 5MB')
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String = e.target.result;
        this.profileImageUrl = base64String;
        
        this.employeeForm.patchValue({
          imageUrl: base64String
        });
        
        this.messageService.add({
          severity: 'success',
          summary: this.getTranslation('employees.formPage.messages.successSummary', 'Success'),
          detail: this.getTranslation('employees.formPage.messages.imageUploadSuccess', 'Image uploaded successfully')
        });
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.profileImageUrl = null;
    this.employeeForm.patchValue({
      imageUrl: ''
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.employeeForm.invalid) {
      this.messageService.add({ 
        severity: 'error', 
        summary: this.getTranslation('employees.formPage.messages.errorSummary', 'Error'), 
        detail: this.getTranslation('employees.formPage.validation.fillRequired', 'Please fill all required fields') 
      });
      return;
    }

    this.loading = true;
    const formData = this.employeeForm.value;

    const backendData = {
      employeeCode: formData.employeeCode,
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender ? formData.gender.charAt(0) : null,
      nationality: formData.nationality,
      religionType: formData.religionType,
      isSpecialNeeds: formData.isSpecialNeeds,
      imageUrl: formData.imageUrl,
      employeeType: formData.employeeType,
      employeeStatus: formData.employeeStatus,
      contact: formData.contact,
      document: {
        passportNumber: formData.document.passportNumber,
        visaNumber: formData.document.visaNumber,
        passportExpirationDate: formData.document.passportExpirationDate ? 
          new Date(formData.document.passportExpirationDate) : null,
        visaExpirationDate: formData.document.visaExpirationDate ? 
          new Date(formData.document.visaExpirationDate) : null
      }
    };

    if (this.isEditMode && this.employeeId) {
      const editData: EditEmployee = {
        id: this.employeeId,
        ...backendData
      };

      console.log('Sending complete employee update data:', JSON.stringify(editData, null, 2));

      this.employeeService.updateEmployee(this.employeeId, editData).subscribe({
        next: (response: ApiResponse<Employee>) => {
          if (response.succeeded) {
            this.messageService.add({ 
              severity: 'success', 
              summary: this.getTranslation('employees.formPage.messages.successSummary', 'Success'), 
              detail: this.getTranslation('employees.formPage.messages.updateSuccess', 'Employee updated successfully') 
            });
            this.router.navigate(['/employees']);
          } else {
            this.messageService.add({ 
              severity: 'error', 
              summary: this.getTranslation('employees.formPage.messages.errorSummary', 'Error'), 
              detail: response.message || this.getTranslation('employees.formPage.messages.updateError', 'Failed to update employee') 
            });
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating employee:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: this.getTranslation('employees.formPage.messages.errorSummary', 'Error'), 
            detail: this.getTranslation('employees.formPage.messages.updateError', 'Failed to update employee') 
          });
          this.loading = false;
        }
      });
    } else {
      const createData: CreateEmployee = {
        ...backendData
      };

      this.employeeService.createEmployee(createData).subscribe({
        next: (response: ApiResponse<Employee>) => {
          if (response.succeeded) {
            this.messageService.add({ 
              severity: 'success', 
              summary: this.getTranslation('employees.formPage.messages.successSummary', 'Success'), 
              detail: this.getTranslation('employees.formPage.messages.createSuccess', 'Employee created successfully') 
            });
            this.router.navigate(['/employees']);
          } else {
            this.messageService.add({ 
              severity: 'error', 
              summary: this.getTranslation('employees.formPage.messages.errorSummary', 'Error'), 
              detail: response.message || this.getTranslation('employees.formPage.messages.createError', 'Failed to create employee') 
            });
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating employee:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: this.getTranslation('employees.formPage.messages.errorSummary', 'Error'), 
            detail: this.getTranslation('employees.formPage.messages.createError', 'Failed to create employee') 
          });
          this.loading = false;
        }
      });
    }
  }

  markFormGroupTouched() {
    Object.keys(this.employeeForm.controls).forEach(key => {
      const control = this.employeeForm.get(key);
      control?.markAsTouched();
    });
  }

  onBack(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.router.navigate(['/employees']);
  }

  get fullName(): string {
    const firstName = this.employeeForm.get('firstName')?.value || '';
    const lastName = this.employeeForm.get('lastName')?.value || '';
    return `${firstName} ${lastName}`.trim();
  }

  get jobTitle(): string {
    return this.employeeForm.get('employeeType')?.value || '';
  }

  navigateToShiftAssignments() {
    if (!this.isEditMode || !this.employeeId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please save the employee first before managing shift assignments'
      });
      return;
    }
    
    const employeeName = this.fullName || 'Employee';
    this.router.navigate(['/employees/shift-assignments', this.employeeId, employeeName]);
  }

  // Shift Assignment Methods
  loadShiftAssignments() {
    if (!this.isEditMode || !this.employeeId) return;
    
    this.loadingShiftAssignments = true;
    this.employeeShiftAssignmentService.getEmployeeShiftAssignmentsByEmployeeId(this.employeeId).subscribe({
      next: (response: ApiResponse<EmployeeShiftAssignment[]>) => {
        if (response.succeeded) {
          this.shiftAssignments = response.data || [];
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load shift assignments'
          });
        }
        this.loadingShiftAssignments = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load shift assignments'
        });
        this.loadingShiftAssignments = false;
      }
    });
  }

  loadShifts() {
    this.employeeShiftAssignmentService.getAllShifts().subscribe({
      next: (response: ApiResponse<any[]>) => {
        if (response.succeeded) {
          this.shifts = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error loading shifts:', error);
      }
    });
  }

  openShiftAssignmentModal(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!this.isEditMode || !this.employeeId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please save the employee first before managing shift assignments'
      });
      return;
    }
    
    this.isEditShiftAssignment = false;
    this.shiftAssignmentForm.reset({
      employeeId: this.employeeId,
      priority: null,
      isOtShift: false,
      isOverwriteHolidays: false,
      isPunchNotRequired: false
    });
    this.selectedDays = [];
    this.selectedFileName = '';
    this.selectedFile = null;
    this.shiftAssignmentDialogVisible = true;
  }

  editShiftAssignment(assignment: EmployeeShiftAssignment, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!this.isEditMode || !this.employeeId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please save the employee first before managing shift assignments'
      });
      return;
    }
    
    this.isEditShiftAssignment = true;
    this.shiftAssignmentForm.patchValue({
      id: assignment.id,
      employeeId: assignment.employeeId,
      shiftId: assignment.shiftId,
      priority: assignment.priority,
      startDateTime: assignment.startDateTime ? assignment.startDateTime.split('T')[0] : null,
      endDateTime: assignment.endDateTime ? assignment.endDateTime.split('T')[0] : null,
      isOtShift: assignment.isOtShift || false,
      isOverwriteHolidays: assignment.isOverwriteHolidays || false,
      isPunchNotRequired: assignment.isPunchNotRequired || false
    });
    this.selectedDays = [];
    this.selectedFileName = '';
    this.shiftAssignmentDialogVisible = true;
  }

  closeShiftAssignmentDialog(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.shiftAssignmentDialogVisible = false;
    this.isEditShiftAssignment = false;
    this.shiftAssignmentForm.reset();
    this.selectedDays = [];
    this.selectedFileName = '';
    this.selectedFile = null;
  }

  onShiftAssignmentSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.shiftAssignmentForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loadingShiftAssignment = true;
    const formData = this.shiftAssignmentForm.value;

    const assignmentData = {
      employeeId: this.employeeId!,
      shiftId: formData.shiftId,
      shiftName: this.shifts.find(s => s.id === formData.shiftId)?.name || '',
      priority: formData.priority,
      startDateTime: formData.startDateTime,
      endDateTime: formData.endDateTime,
      isCurrent: true,
      weekdays: this.selectedDays.map(day => parseInt(day)),
      isOtShift: formData.isOtShift || false,
      isOverwriteHolidays: formData.isOverwriteHolidays || false,
      isPunchNotRequired: formData.isPunchNotRequired || false,
      attachment: this.selectedFile
    };

    if (this.isEditShiftAssignment) {
      this.employeeShiftAssignmentService.updateEmployeeShiftAssignment(formData.id, assignmentData).subscribe({
        next: (response: ApiResponse<EmployeeShiftAssignment>) => {
          if (response.succeeded) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Shift assignment updated successfully'
            });
            this.closeShiftAssignmentDialog();
            this.loadShiftAssignments();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Failed to update shift assignment'
            });
          }
          this.loadingShiftAssignment = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update shift assignment'
          });
          this.loadingShiftAssignment = false;
        }
      });
    } else {
      this.employeeShiftAssignmentService.createEmployeeShiftAssignment(assignmentData).subscribe({
        next: (response: ApiResponse<EmployeeShiftAssignment>) => {
          if (response.succeeded) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Shift assignment created successfully'
            });
            this.closeShiftAssignmentDialog();
            this.loadShiftAssignments();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Failed to create shift assignment'
            });
          }
          this.loadingShiftAssignment = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create shift assignment'
          });
          this.loadingShiftAssignment = false;
        }
      });
    }
  }

  onDayChange(event: any) {
    const dayValue = event.target.value;
    if (event.target.checked) {
      if (!this.selectedDays.includes(dayValue)) {
        this.selectedDays.push(dayValue);
      }
    } else {
      this.selectedDays = this.selectedDays.filter(day => day !== dayValue);
    }
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }


  deleteShiftAssignment(assignment: EmployeeShiftAssignment, event?: Event) {
    console.log('Delete button clicked for assignment:', assignment);
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!assignment || !assignment.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid shift assignment selected for deletion'
      });
      return;
    }
    
    this.assignmentToDelete = assignment;
    this.deleteConfirmationVisible = true;
  }

  cancelDelete(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.deleteConfirmationVisible = false;
    this.assignmentToDelete = null;
  }

  confirmDelete() {
    if (!this.assignmentToDelete) {
      return;
    }
    
    console.log('User confirmed deletion, calling API...');
    this.employeeShiftAssignmentService.deleteEmployeeShiftAssignment(this.assignmentToDelete.id).subscribe({
      next: (response: ApiResponse<boolean>) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Shift assignment deleted successfully'
          });
          this.loadShiftAssignments();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to delete shift assignment'
          });
        }
        this.deleteConfirmationVisible = false;
        this.assignmentToDelete = null;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete shift assignment'
        });
        this.deleteConfirmationVisible = false;
        this.assignmentToDelete = null;
      }
    });
  }

  getPriorityLabel(priority: string | number): string {
    return priority === 1 || priority === '1' ? 'Permanent' : 'Temporary';
  }

  getPrioritySeverity(priority: string | number): string {
    return priority === 1 || priority === '1' ? 'success' : 'info';
  }

  getStatusLabel(isCurrent: boolean): string {
    return isCurrent ? 'Current' : 'Previous';
  }

  getSeverity(isCurrent: boolean): string {
    return isCurrent ? 'success' : 'info';
  }
}
