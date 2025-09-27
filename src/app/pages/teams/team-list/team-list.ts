import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Team } from '../../../interfaces/team.interface';
import { TeamService } from '../teams.service';
import { Router, RouterModule } from "@angular/router";
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { TeamModalComponent } from '../team-modal/team-modal.component';
import { Organization } from '../../../interfaces/organization.interface';
import { LookupService } from '../../organization/OrganizationService';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    MultiSelectModule,
    InputTextModule,
    SliderModule,
    ProgressBarModule,
    TagModule,
    ButtonModule,
    InputIconModule,
    IconFieldModule,
    SelectModule,
    ToastModule,
    TooltipModule,
    RouterModule,
    ConfirmDialogModule,
    TeamModalComponent,
    TranslatePipe
  ],
  providers: [MessageService, ConfirmationService, TranslatePipe],
  templateUrl: './team-list.html'
})
export class TeamListComponent implements OnInit {
  teams: Team[] = [];
  loading: boolean = true;

  // Dialog properties
  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  selectedTeam: Team | null = null;
  organizations: Organization[] = [];
  isSuperAdmin = false;

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private teamService: TeamService,
    private organizationService: LookupService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private authService: AuthService,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit() {
    this.isSuperAdmin = this.checkIsSuperAdmin();
    this.loadTeams();
    this.loadOrganizations();
  }

  private checkIsSuperAdmin(): boolean {
    const claims = this.authService.getClaims();
    return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
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

  loadTeams() {
    this.loading = true;
    this.teamService.getAllTeams().subscribe({
      next: (response: ApiResponse<Team[]>) => {
        if (response.succeeded) {
          this.teams = response.data;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load teams'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load teams'
        });
        this.loading = false;
      }
    });
  }

  getStatus(team: Team): string {
    return (team as any).isDeleted ? 'inactive' : 'active';
  }

  getSeverity(status: string) {
    if (!status) return 'info';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'danger';
      default:
        return 'info';
    }
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.selectedTeam = null;
    this.dialogVisible = true;
  }

  openEditDialog(team: Team) {
    this.isEditMode = true;
    this.selectedTeam = team;
    this.dialogVisible = true;
  }

  onTeamSaved(team: Team) {
    this.loadTeams();
  }

  deleteTeam(team: Team) {
    const message = this.translatePipe.transform('teamList.messages.deleteConfirm').replace('{name}', team.name);
    this.confirmationService.confirm({
      message: message,
      header: this.translatePipe.transform('common.deleteHeader'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.teamService.deleteTeam(team.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Team ${team.name} deleted successfully`
              });
              this.loadTeams();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || 'Failed to delete team'
              });
            }
          },
          error: (error) => {
            console.error('Error deleting team:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete team'
            });
          }
        });
      }
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