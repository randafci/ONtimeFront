import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Custom Services and Pipes
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { RoleService } from '../role.service'; // Adjust path if needed

@Component({
  selector: 'app-add-role',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    RippleModule,
    CheckboxModule,
    ToastModule,
    TranslatePipe,
    RouterLink
  ],
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.scss'],
  providers: [MessageService] // Add MessageService for toasts
})
export class AddRoleComponent implements OnInit {
  roleForm!: FormGroup;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      isHRRole: [false, Validators.required]
    });
  }

  // Getter for easy access to form controls in the template
  get formControls() {
    return this.roleForm.controls;
  }

  onSubmit(): void {
    if (this.roleForm.invalid) {
      // Mark all fields as touched to display validation errors
      this.roleForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    this.roleService.addRole(this.roleForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          // Show success toast
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Role added successfully!' // You could translate this too
          });

          // Navigate back to the roles list after a short delay
          setTimeout(() => {
            this.router.navigate(['/roles']); // Adjust your route path if needed
          }, 1500);
        }
      },
      error: (err) => {
        console.error('Failed to add role', err);
        this.isSaving = false;
        // Show error toast
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add role. Please try again.'
        });
      }
    });
  }
   get name(): AbstractControl {
    return this.roleForm.get('name')!;
  }

  get isHRRole(): AbstractControl {
    return this.roleForm.get('isHRRole')!;
  }
}