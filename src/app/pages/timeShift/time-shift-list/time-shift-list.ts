import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { TimeShiftService } from '../timeShift.service';
import { AddOrEditTimeShift } from '../add-or-edit-time-shift/add-or-edit-time-shift';
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
    AddOrEditTimeShift,
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
    DatePipe,
  ],
  providers: [MessageService, ConfirmationService]
})
export class TimeShiftList {
  timeShifts: any[] = [];
  timeShiftDialogVisible = false; // Changed to false so dialog doesn't open automatically
  isEditMode = false;
  loading = false;
  selectedTimeShift: any = null;

  // Dummy data
  private dummyTimeShifts = [
    { id: 1, dayName: 'Monday', startTime: '09:00 AM', endTime: '05:00 PM', shiftType: 'Regular' },
    { id: 2, dayName: 'Tuesday', startTime: '09:00 AM', endTime: '05:00 PM', shiftType: 'Regular' },
    { id: 3, dayName: 'Wednesday', startTime: '09:00 AM', endTime: '05:00 PM', shiftType: 'Regular' },
    { id: 4, dayName: 'Thursday', startTime: '08:00 AM', endTime: '04:00 PM', shiftType: 'Early' },
    { id: 5, dayName: 'Friday', startTime: '10:00 AM', endTime: '06:00 PM', shiftType: 'Late' },
    { id: 6, dayName: 'Saturday', startTime: '09:00 AM', endTime: '01:00 PM', shiftType: 'Half Day' },
    { id: 7, dayName: 'Sunday', startTime: 'Off', endTime: 'Off', shiftType: 'Weekend' }
  ];

  constructor(
    private timeShiftService: TimeShiftService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadTimeShifts();
  }

  /** 🔹 Load dummy data */
  loadTimeShifts() {
    this.loading = true;
    // Simulate API call delay
    setTimeout(() => {
      this.timeShifts = [...this.dummyTimeShifts];
      this.loading = false;
    }, 1000);
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
      message: `Delete time shift for ${shift.dayName}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        // Simulate API delete delay
        setTimeout(() => {
          this.timeShifts = this.timeShifts.filter(item => item.id !== shift.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: `Time shift for ${shift.dayName} deleted successfully`
          });
          this.loading = false;
        }, 500);
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
    
    if (this.isEditMode) {
      // Update existing shift
      const index = this.timeShifts.findIndex(shift => shift.id === event.id);
      if (index !== -1) {
        this.timeShifts[index] = event;
      }
    } else {
      // Add new shift
      const newId = Math.max(...this.timeShifts.map(s => s.id)) + 1;
      const newShift = {
        ...event,
        id: newId
      };
      this.timeShifts = [newShift, ...this.timeShifts];
    }
    
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `Time shift ${this.isEditMode ? 'updated' : 'added'} successfully`
    });
  }
}