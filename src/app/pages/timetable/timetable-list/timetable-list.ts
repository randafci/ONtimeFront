import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonModule, DatePipe } from '@angular/common';
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
import { Router, RouterModule } from "@angular/router";

import { TimeTable, OrganizationOption } from '../../../interfaces/timetable.interface';
import { Organization } from '../../../interfaces/organization.interface';
import { ApiResponse } from '../../../core/models/api-response.model';

import { TimeTableService } from '../TimeTableService';
import { LookupService } from '../../organization/OrganizationService';
import { AuthService } from '../../../auth/auth.service';
import { TimeTableModalComponent } from '../timetable-modal/timetable-modal.component';
import { AddOrEditTimeShift } from '../time-shift-modal/add-or-edit-time-shift';

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
    TimeTableModalComponent,
    AddOrEditTimeShift
  ],
  providers: [MessageService, ConfirmationService, DatePipe],
  templateUrl: './timetable-list.html',
  styleUrl: './timetable-list.scss'
})
export class TimeTableListComponent implements OnInit {
  timeTables: TimeTable[] = [];
  loading = true;

  dialogVisible = false;
  isEditMode = false;
  selectedTimeTable: TimeTable | null = null;

  // Organization dropdowns
  organizationOptions: OrganizationOption[] = [];
  isSuperAdmin = false;

  // Second dialog (TimeShift)
  timeShiftDialogVisible = false;
  selectedTimeTableId: number | null = null;
  selectedTimeShift: any = { timeTableId: null };

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

  ngOnInit(): void {
    this.isSuperAdmin = this.checkIsSuperAdmin();
    this.loadTimeTables();
    this.loadOrganizations();
  }

  private checkIsSuperAdmin(): boolean {
    const claims = this.authService.getClaims();
    return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
  }

  loadTimeTables(): void {
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
        console.error('Error loading timetables:', error);
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

  openCreateDialog(): void {
    this.isEditMode = false;
    this.selectedTimeTable = null;
    this.dialogVisible = true;
  }

  openEditDialog(timeTable: TimeTable): void {
    this.isEditMode = true;
    this.selectedTimeTable = { ...timeTable };
    this.dialogVisible = true;
  }


openTimeShiftDialog(timeTable: TimeTable): void {
  console.log('🎯 Opening TimeShift dialog for timeTable:', timeTable);
  
  // ✅ FIRST set the timeShift to null/reset it
  this.selectedTimeShift = null;
  
  // ✅ THEN open the dialog
  this.timeShiftDialogVisible = true;
  
  // ✅ THEN set the actual timeShift value (this will trigger ngOnChanges)
  setTimeout(() => {
    this.selectedTimeShift = { 
      timeTableId: timeTable.id,
      shiftId: null, 
      dayNumber: null 
    };
    console.log('📤 Passing timeShift to dialog:', this.selectedTimeShift);
  });
}

  // ✅ Save event from TimeTableModal
  onTimeTableSaved(timeTable: TimeTable): void {
    this.loadTimeTables();
    this.dialogVisible = false;

    if (!this.isEditMode && timeTable && timeTable.id) {
      this.selectedTimeTableId = timeTable.id;
      this.selectedTimeShift = { timeTableId: timeTable.id }; // ✅ Fix binding
      this.timeShiftDialogVisible = true;

      this.messageService.add({
        severity: 'info',
        summary: 'Next Step',
        detail: 'TimeTable created successfully. Please add shift details.'
      });
    }

    
  }

  // ✅ Save event from AddOrEditTimeShift
  handleTimeShiftSave(): void {
    this.timeShiftDialogVisible = false;
    this.selectedTimeTableId = null;
    this.selectedTimeShift = { timeTableId: null };

    this.messageService.add({
      severity: 'success',
      summary: 'Shift Saved',
      detail: 'Time shift was added successfully!'
    });
  }

  deleteTimeTable(timeTable: TimeTable): void {
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
                summary: 'Deleted',
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
            console.error('Error deleting timetable:', error);
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
    const parts = timeString.split(':');
    return parts.length >= 2 ? `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}` : timeString;
  }

  formatShiftDuration(timeTable: TimeTable): string {
    if (!timeTable.shiftHours) return '-';
    const formatted = this.formatTime(timeTable.shiftHours);
    return formatted !== '-' ? `${formatted} hrs` : '-';
  }

  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table): void {
    table.clear();
    if (this.filter) this.filter.nativeElement.value = '';
  }
}
