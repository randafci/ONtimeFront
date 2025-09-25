import { User } from '../../../auth/user.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { UserService } from '../userService';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiResponse } from '../../../core/models/api-response.model';
import { UserDto, UpdateUserDto, CreateUserDto } from '../../../interfaces/user.interface';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Toast, ToastModule } from "primeng/toast";
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CheckboxModule } from 'primeng/checkbox';
import { Employee } from '../../../interfaces/employee.interface';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { Organization } from '@/interfaces/organization.interface';
import { AuthService } from '@/auth/auth.service';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';

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
  organizations: Organization[] = [];
  isSuperAdmin = false;
  loadingEmployees = false;
  loadingOrganizations = false;
  private translations: any = {};

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private messageService: MessageService,
    private authService: AuthService,
    private translationService: TranslationService
  ) {
    this.userForm = this.fb.group({
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      isLdapUser: [false],
      extraEmployeesView: [''],
      employeeId: [null],
      organizationId: [null]
    });
  }

  ngOnInit(): void {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });

    this.isSuperAdmin = this.checkIsSuperAdmin();
    this.loadEmployees();
    if (this.isSuperAdmin) {
      this.loadOrganizations();
    }

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = params['id'];
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();
        this.loadUser(this.userId!);
      }
    });

    this.userForm.get('isLdapUser')?.valueChanges.subscribe((isLdap: boolean) => {
      this.toggleLdapValidators(isLdap);
    });
  }

  private toggleLdapValidators(isLdap: boolean): void {
    const fieldsToValidate = ['userName', 'email'];
    if (isLdap) {
      fieldsToValidate.forEach(field => this.userForm.get(field)?.clearValidators());
    } else {
      this.userForm.get('userName')?.setValidators([Validators.required]);
      this.userForm.get('email')?.setValidators([Validators.required, Validators.email]);
    }
    fieldsToValidate.forEach(field => this.userForm.get(field)?.updateValueAndValidity());
  }

  loadUser(id: string): void {
    this.loading = true;
    this.userService.getById(id).subscribe({
      next: (response: ApiResponse<UserDto>) => {
        if (response.succeeded && response.data) {
          this.userForm.patchValue(response.data);
        } else {
          this.showToast('error', 'Error', this.translations.users?.formPage?.toasts?.loadError);
        }
        this.loading = false;
      },
      error: () => {
        this.showToast('error', 'Error', this.translations.users?.formPage?.toasts?.loadError);
        this.loading = false;
      }
    });
  }

  loadEmployees(): void {
    this.loadingEmployees = true;
    this.userService.getEmployees().subscribe({
      next: (response: ApiResponse<Employee[]>) => {
        if (response.succeeded) this.employees = response.data || [];
        this.loadingEmployees = false;
      },
      error: (error) => {
        this.loadingEmployees = false;
      }
    });
  }

  private checkIsSuperAdmin(): boolean {
    const claims = this.authService.getClaims();
    return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
  }

  loadOrganizations(): void {
    this.loadingOrganizations = true;
    this.userService.getOrganizations().subscribe({
      next: (response: ApiResponse<Organization[]>) => {
        if (response.succeeded) this.organizations = response.data || [];
        this.loadingOrganizations = false;
      },
      error: (error) => {
        this.loadingOrganizations = false;
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
      const updateDto: UpdateUserDto = { id: this.userId, ...formData };
      if (!formData.password) delete (updateDto as any).password;
      
      this.userService.update(updateDto).subscribe(this.getObserver('update'));
    } else {
      this.userService.create(formData as CreateUserDto).subscribe(this.getObserver('create'));
    }
  }

  private getObserver(action: 'create' | 'update') {
    const toastKey = `${action}Success`;
    return {
      next: () => {
        this.showToast('success', 'Success', this.translations.users?.formPage?.toasts[toastKey]);
        this.router.navigate(['/users']);
      },
      error: () => {
        const errorKey = `${action}Error`;
        this.showToast('error', 'Error', this.translations.users?.formPage?.toasts[errorKey]);
        this.loading = false;
      }
    };
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) this.markFormGroupTouched(control);
    });
  }
  
  onCancel(): void {
    this.router.navigate(['/users']);
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}