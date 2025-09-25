import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '@/auth/auth.service';

// Custom Services and Pipes
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { RoleService } from '../role.service'; // Adjust path if needed

@Component({
  selector: 'app-add-edit-role',
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
  templateUrl: './add-edit-role.component.html',
  styleUrls: ['./add-edit-role.component.scss'],
  providers: [MessageService] // Add MessageService for toasts
})
export class AddEditRoleComponent implements OnInit {
  roleForm!: FormGroup;
  isSaving = false;
  isEditMode = false;
  private roleId: string | null = null;
   isAdmin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private router: Router,
    private route: ActivatedRoute, // Inject ActivatedRoute
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.roleId; // Set edit mode based on ID presence
    this.isAdmin=this.checkIsSuperAdmin();
    this.initializeForm();

    if (this.isEditMode && this.roleId) {
      this.loadRoleData(this.roleId);
    }
  }
 
  initializeForm(): void {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      isHRRole: [false, Validators.required],
        isSuperAdmin: [false, Validators.required],
  isHRManager: [false, Validators.required],
  isHRAdministrator: [false, Validators.required],
  isHRSpecialist: [false, Validators.required],
      // Add isDefaultRole to the form for editing
      isDefaultRole: [false] 
    });
  }

  loadRoleData(id: string): void {
    this.roleService.getRoleById(id).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.roleForm.patchValue(response.data);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load role data.' });
        }
      }
    });
  }

  onSubmit(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    // Conditionally call update or add
    if (this.isEditMode && this.roleId) {
      this.roleService.updateRole(this.roleId, this.roleForm.value).subscribe(this.getObserver('updated'));
    } else {
      this.roleService.addRole(this.roleForm.value).subscribe(this.getObserver('added'));
    }
  }

  // Helper to reduce code duplication in subscribe blocks
  private getObserver(action: 'added' | 'updated') {
    return {
      next: (response: any) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Role ${action} successfully!`
          });
          setTimeout(() => this.router.navigate(['/roles']), 1500);
        } else {
          this.isSaving = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error: (err: any) => {
        this.isSaving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || `Failed to perform action.` });
      }
    };
  }

   get formControls() {
    return this.roleForm.controls;
  }
  private checkIsSuperAdmin(): boolean {
    const claims = this.authService.getClaims();
    return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
  }

  // --- Getters ---
  get name(): AbstractControl { return this.roleForm.get('name')!; }
  get isHRRole(): AbstractControl { return this.roleForm.get('isHRRole')!; }
}