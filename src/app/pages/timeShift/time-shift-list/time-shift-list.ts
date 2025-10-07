import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { TimeShiftService } from '../timeShift.service';
import { AddOrEditTimeShiftforTest } from '../add-or-edit-time-shift/add-or-edit-time-shift';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-time-shift-list',
  standalone: true,
  templateUrl: './time-shift-list.html',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ToastModule,
    ConfirmDialogModule,
    AddOrEditTimeShiftforTest,
    TranslatePipe,
     CommonModule,
    FormsModule,
    MultiSelectModule,
    SliderModule,
    ProgressBarModule,
    TagModule,
    ButtonModule,
    IconFieldModule,
    SelectModule,
    TooltipModule,
    RouterModule,
  ],
  providers: [MessageService, ConfirmationService]
})
export class TimeShiftList {
  timeShifts: any[] = [];
  timeShiftDialogVisible = false; // Changed to false so dialog doesn't open automatically
  isEditMode = false;
  loading = false;
  selectedTimeShift: any = null;


  constructor(
    private timeShiftService: TimeShiftService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadTimeShifts();
  }

  /** 🔹 Load time shifts from API */
  loadTimeShifts() {
    this.loading = true;
    this.timeShiftService.getAll().subscribe({
      next: (response) => {
        if (response.succeeded) {
          // Transform the data to include display fields
          this.timeShifts = (response.data || []).map(shift => this.transformTimeShiftForDisplay(shift));
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load time shifts'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load time shifts'
        });
        this.loading = false;
      }
    });
  }

  /** 🔹 Transform TimeShift data for display */
  private transformTimeShiftForDisplay(shift: any): any {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return {
      ...shift,
      dayName: dayNames[shift.dayNumber] || `Day ${shift.dayNumber}`,
      startTime: shift.startTime || 'N/A',
      endTime: shift.endTime || 'N/A',
      shiftType: shift.shiftType || 'Regular'
    };
  }

  /** 🔹 Open Add dialog */
  openAddDialog() {
    this.isEditMode = false;
    this.selectedTimeShift = null;
    this.timeShiftDialogVisible = true;
  }

  /** 🔹 Open Edit dialog */
  openEditDialog(shift: any) {
    this.isEditMode = true;
    this.selectedTimeShift = { ...shift }; // Create a copy to avoid direct reference
    this.timeShiftDialogVisible = true;
  }

  /** 🔹 Delete item with confirmation */
  deleteTimeShift(shift: any) {
    this.confirmationService.confirm({
      message: `Delete time shift for ${shift.dayName || 'this day'}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.timeShiftService.delete(shift.id).subscribe({
          next: (response) => {
            if (response.succeeded) {
              this.messageService.add({
                severity: 'success',
                summary: 'Deleted',
                detail: `Time shift deleted successfully`
              });
              // Refresh the data to show updated list
              this.loadTimeShifts();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || 'Failed to delete time shift'
              });
              this.loading = false;
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete time shift'
            });
            this.loading = false;
          }
        });
      }
    });
  }

  /** 🔹 Clear table filters */
  clear(dt: any) {
    dt.clear();
  }

  /** 🔹 Handle global filter */
  onGlobalFilter(dt: any, event: any) {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  /** 🔹 Called when dialog is saved */
  onTimeShiftSaved(event: any) {
    this.timeShiftDialogVisible = false;
    
    // Refresh the data from the API to show the latest changes
    this.loadTimeShifts();
    
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `Time shift ${this.isEditMode ? 'updated' : 'added'} successfully`
    });
  }
}