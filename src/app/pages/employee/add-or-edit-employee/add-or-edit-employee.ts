import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';

import { MessageService } from 'primeng/api';
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
    RouterModule,
    TranslatePipe
  ],
  providers: [MessageService],
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

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private translationService: TranslationService,
    private tabPersistenceService: TabPersistenceService
  ) {
    this.employeeForm = this.createForm();
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
    }
  }

  onTabChange(tabIndex: number): void {
    this.tabPersistenceService.changeTab(tabIndex, this.route, TAB_CONFIGS.EMPLOYEE_FORM);
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

  onBack() {
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
}
