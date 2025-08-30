import { User } from '@/auth/user.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { UserService } from '../userService';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiResponse } from '@/core/models/api-response.model';
import { UserDto, UpdateUserDto, CreateUserDto } from '@/interfaces/user.interface';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Toast, ToastModule } from "primeng/toast";
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CheckboxModule } from 'primeng/checkbox';
import { Employee } from '@/interfaces/employee.interface';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-add-or-edit-user',
    standalone: true, // since you're using 'imports' array in @Component
  imports: [CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    TranslatePipe,
    //DatePipe, 
    Toast,
    ToggleButtonModule, // <--- for p-toggleButton
    CheckboxModule,
     SelectButtonModule,
    ToggleButtonModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    FormsModule,
    ReactiveFormsModule,
    SelectModule
  ]

  ,
  providers: [MessageService],
  templateUrl: './add-or-edit-user.html',
  styleUrl: './add-or-edit-user.scss'
})
export class AddOrEditUser implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  loading = false;
  submitted = false;
  employees: Employee[] = [];
loadingEmployees= false;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private messageService: MessageService
  ) {
    this.userForm = this.fb.group({
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      isLdapUser: [false],
      extraEmployeesView: [''],
      employeeId: [null]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = params['id'];
        this.loadUser(this.userId!);
      }
    });
  }

  loadUser(id: string): void {
    this.loadEmployees();

    this.loading = true;
    this.userService.getById(id).subscribe({
      next: (response: ApiResponse<UserDto>) => {
        if (response.statusCode === 200 && response.data) {
          this.userForm.patchValue({
            userName: response.data.userName,
            email: response.data.email,
            isLdapUser: response.data.isLdapUser,
            extraEmployeesView: response.data.extraEmployeesView,
            employeeId: response.data.employeeId
          });
          // Hide password on edit
          this.userForm.get('password')?.clearValidators();
          this.userForm.get('password')?.updateValueAndValidity();
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
  loadEmployees(): void {
    this.loadingEmployees = true;
    this.userService.getEmployees().subscribe({
      next: (response: ApiResponse<Employee[]>) => {
        if (response.succeeded) {
          this.employees = response.data || [];
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Failed to load employees list'
          });
        }
        this.loadingEmployees = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load employees'
        });
        this.loadingEmployees = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    this.loading = true;
    const formData = this.userForm.value;

    if (this.isEditMode && this.userId) {
      const updateDto: UpdateUserDto = {
        id: this.userId,
        userName: formData.userName,
        email: formData.email,
        isLdapUser: formData.isLdapUser,
        extraEmployeesView: formData.extraEmployeesView,
        employeeId: formData.employeeId
      };
      if (formData.password) (updateDto as any).password = formData.password; // optional password update

      this.userService.update(updateDto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User updated successfully' });
          this.router.navigate(['/users']);
        },
        error: () => this.loading = false
      });
    } else {
      const createDto: CreateUserDto = {
        password: formData.password,
        isLdapUser: formData.isLdapUser,
        extraEmployeesView: formData.extraEmployeesView,
        employeeId: formData.employeeId
      };

      this.userService.create(createDto).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User created successfully' });
          this.router.navigate(['/users']);
        },
        error: () => this.loading = false
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }
}