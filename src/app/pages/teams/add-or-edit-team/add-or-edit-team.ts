import { AuthService } from '@/auth/auth.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { Team, EditTeam, CreateTeam } from '@/interfaces/team.interface';
import { TranslationService } from '@/pages/translation-manager/translation-manager/translation.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TeamService } from '../teams.service';
import { Organization } from '@/interfaces/organization.interface';
import { LookupService } from '@/pages/organization/OrganizationService';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-add-or-edit-team',
  imports: [CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    SelectModule,
    TranslatePipe],
    providers: [MessageService],

  templateUrl: './add-or-edit-team.html',
  styleUrl: './add-or-edit-team.scss'
})
export class AddOrEditTeam implements OnInit {
  teamForm: FormGroup;
  isEditMode = false;
  teamId: number | null = null;
  loading = false;
  submitted = false;
  private translations: any = {};
  isSuperAdmin = false;
  organizations: Organization[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private messageService: MessageService,
    private translationService: TranslationService,
    private authService: AuthService,
    private organizationService: LookupService,
    
  ) {
    this.teamForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      nameSE: ['', Validators.required],
      organizationId: [null]   // add this

    });
  }

  ngOnInit(): void {
    // Subscribe to translation changes
     this.isSuperAdmin = this.checkIsSuperAdmin();
    
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) this.teamForm.patchValue({ organizationId: +orgId });
    }

    this.loadOrganizations();
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.teamId = +params['id'];
        this.loadTeam(this.teamId);
      }
    });
  }

    loadOrganizations(): void {
      this.organizationService.getAllOrganizations().subscribe({
        next: (response: ApiResponse<Organization[]>) => {
          if (response.succeeded) {
            this.organizations = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading organizations:', error);
        }
      });
    }
  
     private checkIsSuperAdmin(): boolean {
    const claims = this.authService.getClaims();
    return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
  }

  loadTeam(id: number): void {
    this.loading = true;
    this.teamService.getTeamById(id).subscribe({
      next: (response: ApiResponse<Team>) => {
        if (response.succeeded && response.data) {
          this.teamForm.patchValue({
            code: response.data.code,
            name: response.data.name,
            nameSE: response.data.nameSE
          });
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
          detail: this.translations.teamForm?.toasts?.loadError || 'Failed to load team data'
        });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.teamForm.invalid) {
      this.markFormGroupTouched(this.teamForm);
      return;
    }

    this.loading = true;
    const formData = this.teamForm.value;

    if (this.isEditMode && this.teamId) {
      const editData: EditTeam = {
        id: this.teamId,
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        organizationId: this.isSuperAdmin ? formData.organizationId : formData.organizationId 

      };
      this.updateTeam(editData);
    } else {
      const createData: CreateTeam = {
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        organizationId: this.isSuperAdmin ? formData.organizationId : formData.organizationId

      };
      this.createTeam(createData);
    }
  }

  createTeam(data: CreateTeam): void {
    this.teamService.createTeam(data).subscribe({
      next: (response: ApiResponse<Team>) => {
        this.messageService.add({
          severity: 'success',
          summary: this.translations.common?.success || 'Success',
          detail: this.translations.teamForm?.toasts?.createSuccess || 'Team created successfully'
        });
        this.router.navigate(['/teams']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
          detail: this.translations.teamForm?.toasts?.createError || 'Failed to create team'
        });
        this.loading = false;
      }
    });
  }

  updateTeam(data: EditTeam): void {
    this.teamService.updateTeam(data).subscribe({
      next: (response: ApiResponse<Team>) => {
        this.messageService.add({
          severity: 'success',
          summary: this.translations.common?.success || 'Success',
          detail: this.translations.teamForm?.toasts?.updateSuccess || 'Team updated successfully'
        });
        this.router.navigate(['/teams']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
          detail: this.translations.teamForm?.toasts?.updateError || 'Failed to update team'
        });
        this.loading = false;
      }
    });
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
    this.router.navigate(['/teams']);
  }
}