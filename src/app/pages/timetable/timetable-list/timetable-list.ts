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
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TimeTable, OrganizationOption } from '../../../interfaces/timetable.interface';
import { TimeTableService } from '../TimeTableService';
import { Router, RouterModule, NavigationEnd } from "@angular/router";
import { DatePipe } from '@angular/common';
import { filter } from 'rxjs/operators';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { TimeTableModalComponent } from '../timetable-modal/timetable-modal.component';
import { LookupService } from '../../organization/OrganizationService';
import { Organization } from '../../../interfaces/organization.interface';

@Component({
  selector: 'app-timetable-list',
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
    SelectButtonModule,
    ToastModule,
    RouterModule,
    ConfirmDialogModule,
    TooltipModule,
    TimeTableModalComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './timetable-list.html',
  styleUrl: './timetable-list.scss'
})
export class TimeTableListComponent implements OnInit {
  timeTables: TimeTable[] = [];
  loading: boolean = true;

  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  selectedTimeTable: TimeTable | null = null;
  organizationOptions: OrganizationOption[] = [];
  isSuperAdmin = false;

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private timeTableService: TimeTableService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private authService: AuthService,
    private organizationService: LookupService
  ) {}

  ngOnInit() {
    this.isSuperAdmin = this.checkIsSuperAdmin();
    this.loadTimeTables();
    this.loadOrganizations();
  }

  private checkIsSuperAdmin(): boolean {
    const claims = this.authService.getClaims();
    return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
  }

  loadTimeTables() {
    this.loading = true;
    this.timeTableService.getAllTimeTables().subscribe({
      next: (response: ApiResponse<TimeTable[]>) => {
        if (response.succeeded) {
          this.timeTables = response.data || [];
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load timetables'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading time tables:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load timetables'
        });
        this.loading = false;
      }
    });
  }

  loadOrganizations(): void {
    this.organizationService.getAllOrganizations().subscribe({
      next: (response: ApiResponse<Organization[]>) => {
        if (response.succeeded) {
          this.organizationOptions = response.data.map(org => ({
            label: org.name,
            value: org.id
          }));
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load organizations'
          });
        }
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load organizations'
        });
      }
    });
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.selectedTimeTable = null;
    this.dialogVisible = true;
  }

  openEditDialog(timeTable: TimeTable) {
    this.isEditMode = true;
    this.selectedTimeTable = timeTable;
    this.dialogVisible = true;
  }

  onTimeTableSaved(timeTable: TimeTable) {
    this.loadTimeTables();
  }

  deleteTimeTable(timeTable: TimeTable) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${timeTable.nameEn || timeTable.nameAr || 'this timetable'}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.timeTableService.deleteTimeTable(timeTable.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'TimeTable deleted successfully'
              });
              this.loadTimeTables();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || 'Failed to delete timetable'
              });
            }
          },
          error: (error) => {
            console.error('Error deleting time table:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete timetable'
            });
          }
        });
      }
    });
  }

  getShiftTypeDisplay(timeTable: TimeTable): string {
    if (timeTable.isNightShift) return 'Night Shift';
    if (timeTable.isPreNightShift) return 'Pre-Night';
    if (timeTable.isWeekend) return 'Weekend';
    if (timeTable.isTrainingCourse) return 'Training';
    return 'Regular';
  }

  getShiftTypeSeverity(timeTable: TimeTable): string {
    if (timeTable.isNightShift) return 'info';
    if (timeTable.isPreNightShift) return 'warning';
    if (timeTable.isWeekend) return 'success';
    if (timeTable.isTrainingCourse) return 'secondary';
    return 'primary';
  }

  formatTime(timeString?: string): string {
    if (!timeString) return '-';
    // Handle both "HH:MM:SS" and "HH:MM" formats
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      return `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
    }
    return timeString;
  }

  formatShiftDuration(timeTable: TimeTable): string {
    if (!timeTable.shiftHours) return '-';
    const formatted = this.formatTime(timeTable.shiftHours);
    return formatted !== '-' ? `${formatted} hrs` : '-';
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }
}