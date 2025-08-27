import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';

import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Employee, CreateEmployee, EditEmployee } from '@/interfaces/employee.interface';
import { EmployeeService } from '../EmployeeService';
import { ApiResponse } from '@/interfaces/apiResponse.interface';

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
    RouterModule
  ],
  providers: [MessageService],
  templateUrl: './add-or-edit-employee.html',
  styleUrl: './add-or-edit-employee.scss'
})
export class AddEditEmployeeComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  employeeId: number | null = null;
  loading = false;
  submitted = false;
  activeTabIndex = 0;
  profileImageUrl: string | null = null;

  // Dropdown options
  genderOptions = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' }
  ];

  employeeStatusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'On Leave', value: 'on leave' },
    { label: 'Terminated', value: 'terminated' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Probation', value: 'probation' }
  ];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.employeeForm = this.createForm();
  }

  ngOnInit() {
    this.employeeId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.employeeId;

    if (this.isEditMode && this.employeeId) {
      this.loadEmployee(this.employeeId);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      // General Information - matches backend DTO
      employeeCode: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      nationality: [''],
      religionType: [''],
      isSpecialNeeds: [false],
      employeeType: [''],
      employeeStatus: ['active'], // Default to active for new employees
      
      // Contact Information - matches backend DTO
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

      // Document Information - matches backend DTO
      document: this.fb.group({
        passportNumber: [''],
        passportExpirationDate: [''],
        visaNumber: [''],
        visaExpirationDate: ['']
      }),

      // Display Settings (for UI only)
      displayInReport: [true],
      displayInReportsDashboard: [true],
      imageUrl: [''] // Add imageUrl to the form
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
            summary: 'Error',
            detail: response.message || 'Failed to load employee'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employee:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load employee'
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
    
    // Set profile image URL for display
    if (employee.imageUrl) {
      // Only set the image URL if it's a valid URL or base64 data
      if (employee.imageUrl.startsWith('data:') || employee.imageUrl.startsWith('http')) {
        this.profileImageUrl = employee.imageUrl;
      } else {
        // If it's just a filename or invalid URL, don't set it
        this.profileImageUrl = null;
      }
    } else {
      this.profileImageUrl = null;
    }
  }

  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Please select an image file'
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Image size should be less than 5MB'
        });
        return;
      }

      // Convert image to base64 and create data URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String = e.target.result;
        this.profileImageUrl = base64String;
        
        // Update form with the base64 image data
        this.employeeForm.patchValue({
          imageUrl: base64String
        });
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Image uploaded successfully'
        });
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(event: Event) {
    event.stopPropagation(); // Prevent triggering the file input
    this.profileImageUrl = null;
    this.employeeForm.patchValue({
      imageUrl: ''
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.employeeForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required fields' });
      return;
    }

    this.loading = true;
    const formData = this.employeeForm.value;

    // Prepare data exactly as expected by backend EmployeeDto
    const backendData = {
      employeeCode: formData.employeeCode,
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender ? formData.gender.charAt(0) : null, // Convert to char
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
        // Convert string dates to DateTime or null
        passportExpirationDate: formData.document.passportExpirationDate ? 
          new Date(formData.document.passportExpirationDate) : null,
        visaExpirationDate: formData.document.visaExpirationDate ? 
          new Date(formData.document.visaExpirationDate) : null
      }
    };

    if (this.isEditMode && this.employeeId) {
      // Send complete data including Contact and Document for update
      const editData = {
        id: this.employeeId,
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
          // Convert string dates to DateTime or null
          passportExpirationDate: formData.document.passportExpirationDate ? 
            new Date(formData.document.passportExpirationDate) : null,
          visaExpirationDate: formData.document.visaExpirationDate ? 
            new Date(formData.document.visaExpirationDate) : null
        }
      };

      console.log('Sending complete employee update data:', JSON.stringify(editData, null, 2));

      this.employeeService.updateEmployee(this.employeeId, editData).subscribe({
        next: (response: ApiResponse<Employee>) => {
          if (response.succeeded) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Employee updated successfully' });
            this.router.navigate(['/employees']);
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message || 'Failed to update employee' });
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating employee:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update employee' });
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
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Employee created successfully' });
            this.router.navigate(['/employees']);
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message || 'Failed to create employee' });
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating employee:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create employee' });
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
}
