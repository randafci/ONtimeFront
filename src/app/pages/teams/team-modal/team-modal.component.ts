import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Team, CreateTeam, EditTeam } from '../../../interfaces/team.interface';
import { TeamService } from '../teams.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { Organization } from '../../../interfaces/organization.interface';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-team-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    TranslatePipe
  ],
  providers: [MessageService],
  templateUrl: './team-modal.component.html',
})
export class TeamModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() team: Team | null = null;
  @Input() organizations: Organization[] = [];
  @Input() isSuperAdmin: boolean = false;
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<Team>();
  @Output() onCancelEvent = new EventEmitter<void>();

  teamForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.teamForm = this.createForm();
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.dialogVisible && this.team) {
      this.loadTeamData();
    } else if (this.dialogVisible && !this.isEditMode) {
      this.resetForm();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      nameSE: ['', [Validators.maxLength(200)]],
      organizationId: [null, Validators.required]
    });
  }

  loadTeamData(): void {
    if (this.team) {
      this.teamForm.patchValue({
        id: this.team.id,
        code: this.team.code,
        name: this.team.name,
        nameSE: this.team.nameSE || '',
        organizationId: this.team.organizationId
      });
    }
  }

  resetForm(): void {
    this.teamForm.reset();
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.teamForm.patchValue({ organizationId: +orgId });
      }
    }
  }

  onSubmit(): void {
    if (this.teamForm.invalid) {
      this.markFormGroupTouched(this.teamForm);
      return;
    }

    const formData = this.teamForm.value;

    if (this.isEditMode) {
      const editData: EditTeam = {
        id: this.teamForm.get('id')?.value,
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE || '',
        organizationId: formData.organizationId
      };
      this.updateTeam(editData);
    } else {
      const createData: CreateTeam = {
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE || '',
        organizationId: formData.organizationId
      };
      this.createTeam(createData);
    }
  }

  createTeam(data: CreateTeam): void {
    this.teamService.createTeam(data).subscribe({
      next: (response: ApiResponse<Team>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Team created successfully'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create team'
        });
      }
    });
  }

  updateTeam(data: EditTeam): void {
    this.teamService.updateTeam(data).subscribe({
      next: (response: ApiResponse<Team>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Team updated successfully'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update team'
        });
      }
    });
  }

  onDialogHide(): void {
    this.closeDialog();
  }

  closeDialog(): void {
    this.dialogVisibleChange.emit(false);
  }

  onCancel(): void {
    this.closeDialog();
    this.onCancelEvent.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
