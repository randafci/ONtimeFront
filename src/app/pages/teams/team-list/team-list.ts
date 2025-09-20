import { ApiResponse } from '@/core/models/api-response.model';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { Team } from '@/interfaces/team.interface';
import { TranslationService } from '@/pages/translation-manager/translation-manager/translation.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TeamService } from '../teams.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-team-list',
  imports: [CommonModule,
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
    RouterModule,
    DatePipe,
    TranslatePipe,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './team-list.html',
  styleUrl: './team-list.scss'
})
export class TeamList  implements OnInit {
  teams: Team[] = [];
  loading: boolean = true;

  statuses: any[] = [];
  activityValues: number[] = [0, 100];

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  private translations: any = {};

  constructor(
    private teamService: TeamService,
    private messageService: MessageService,
    private router: Router,
    private translationService: TranslationService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
      this.statuses = [
        { label: translations.teamList?.statusValues?.active || 'Active', value: 'active' },
        { label: translations.teamList?.statusValues?.inactive || 'Inactive', value: 'inactive' }
      ];
    });

    this.loadTeams();
  }

  loadTeams() {
    this.loading = true;
    this.teamService.getAllTeams().subscribe({
      next: (response: ApiResponse<Team[]>) => {
        if (response.succeeded) {
          this.teams = response.data || [];
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.translations.common?.error || 'Error',
            detail: response.message || this.translations.teamList?.messages?.loadError
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
          detail: this.translations.teamList?.messages?.loadError
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

  navigateToAdd() {
    this.router.navigate(['/teams/add']);
  }

  navigateToEdit(id: number) {
    this.router.navigate(['/teams/edit', id]);
  }

deleteTeam(team: Team) {
  const message = (this.translations.teamList?.messages?.deleteConfirm || '')
    .replace('${name}', team.name);

  this.confirmationService.confirm({
    message: message,
    header: this.translations.teamList?.messages?.deleteHeader || 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.teamService.deleteTeam(team.id).subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.teams = this.teams.filter(t => t.id !== team.id); // remove from table
            this.messageService.add({
              severity: 'success',
              summary: this.translations.common?.success || 'Success',
              detail: this.translations.teamList?.messages?.deleteSuccess || 'Team deleted successfully'
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translations.common?.error || 'Error',
              detail: response.message || this.translations.teamList?.messages?.deleteError
            });
          }
        },
        error: (err) => {
          console.error('Delete error:', err);
          this.messageService.add({
            severity: 'error',
            summary: this.translations.common?.error || 'Error',
            detail: this.translations.teamList?.messages?.deleteError || 'Failed to delete team'
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