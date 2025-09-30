import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

// Custom
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { TimeShiftService } from '../timeShift.service';
import { TimeShift } from '@/interfaces/time-shift.interface';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-schedule',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CardModule,
    SkeletonModule,
    TagModule,
    ToastModule,
    MessageModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TranslatePipe
  ],
  providers: [MessageService],
  templateUrl: './user-schedule.html',
  styleUrls: ['./user-schedule.scss']
})
export class UserSchedule implements OnInit {
  userSchedule: TimeShift[] = [];
  loading = false;
  error = '';

  constructor(
    private timeShiftService: TimeShiftService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadUserSchedule();
  }

  loadUserSchedule(): void {
    this.loading = true;
    this.error = '';

    this.timeShiftService.getUserSchedule().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.succeeded && response.data) {
          this.userSchedule = response.data;
          if (this.userSchedule.length === 0) {
            this.error = 'No schedule found for your account.';
          }
        } else {
          this.error = response.message || 'Failed to load schedule.';
          this.showError(this.error);
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Failed to load user schedule. Please try again.';
        this.showError(this.error);
        console.error('Error loading user schedule:', error);
      }
    });
  }

  refreshSchedule(): void {
    this.loadUserSchedule();
  }

  getDayName(dayNumber: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber - 1] || 'Unknown';
  }

  getShiftType(shiftId: number): string {
    const shiftTypes: { [key: number]: string } = {
      1: 'Morning',
      2: 'Evening',
      3: 'Night'
    };
    return shiftTypes[shiftId] || 'Regular';
  }

  getShiftTypeClass(shiftId: number): string {
    const classes: { [key: number]: string } = {
      1: 'success',
      2: 'warning',
      3: 'info'
    };
    return classes[shiftId] || 'primary';
  }

  clear(dt: any): void {
    dt.clear();
  }

  onGlobalFilter(dt: any, event: Event): void {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
  }
}
