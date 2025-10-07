import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { TimeShiftService } from '../timeShift.service';
import { DaySelection, TimeShift, CreateTimeShift, UpdateTimeShift } from '@/interfaces/time-shift.interface';
import { MessageService } from 'primeng/api';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-add-or-edit-time-shift',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    ButtonModule,
    TranslatePipe
  ],
  templateUrl: './add-or-edit-time-shift.html',
  styleUrls: ['./add-or-edit-time-shift.scss']
})
export class AddOrEditTimeShiftforTest implements OnInit {
  /** ✅ Two-way binding */
  @Input() dialogVisible = false;
  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Input() timeShift: any = null;

  /** ✅ Other inputs */
  @Input() isEditMode = false;
  @Input() loading = false;
  @Output() onSave = new EventEmitter<void>(); // Changed to emit when save is complete

  timeShiftForm!: FormGroup;
  timeTables: any[] = [];
  shifts: any[] = [];

  days: DaySelection[] = [
    { dayName: 'Sunday', dayNumber: 0, isSelected: false, isWeekend: true },
    { dayName: 'Monday', dayNumber: 1, isSelected: false, isWeekend: false },
    { dayName: 'Tuesday', dayNumber: 2, isSelected: false, isWeekend: false },
    { dayName: 'Wednesday', dayNumber: 3, isSelected: false, isWeekend: false },
    { dayName: 'Thursday', dayNumber: 4, isSelected: false, isWeekend: false },
    { dayName: 'Friday', dayNumber: 5, isSelected: false, isWeekend: false },
    { dayName: 'Saturday', dayNumber: 6, isSelected: false, isWeekend: true }
  ];

  constructor(
    private fb: FormBuilder, 
    private timeShiftService: TimeShiftService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadTimeTables();
    this.loadShifts();
    
    if (this.isEditMode && this.timeShift) {
      this.patchFormValues();
    }
  }

  private initForm() {
    this.timeShiftForm = this.fb.group({
      timeTableId: [null, Validators.required],
      shiftId: [null, Validators.required],
      days: this.fb.array([]) // FormArray for days
    });

    // Initialize days form array
    this.initializeDaysFormArray();
  }

  private initializeDaysFormArray() {
    const daysArray = this.timeShiftForm.get('days') as FormArray;
    daysArray.clear();
    
    this.days.forEach(day => {
      daysArray.push(this.fb.group({
        dayName: [day.dayName],
        dayNumber: [day.dayNumber],
        isSelected: [day.isSelected],
        isWeekend: [day.isWeekend]
      }));
    });
  }

  get daysFormArray(): FormArray {
    return this.timeShiftForm.get('days') as FormArray;
  }

  getDayFormGroup(index: number): FormGroup {
    return this.daysFormArray.at(index) as FormGroup;
  }

  private patchFormValues() {
    this.timeShiftForm.patchValue({
      timeTableId: this.timeShift.timeTableId,
      shiftId: this.timeShift.shiftId
    });

    // Update days form array based on the timeShift data
    const daysArray = this.daysFormArray;
    this.days.forEach((day, index) => {
      const isSelected = day.dayNumber === this.timeShift.dayNumber;
      daysArray.at(index).patchValue({
        isSelected: isSelected,
        isWeekend: this.timeShift.isWeekend || false
      });
    });
  }

  // Handle day selection change to ensure only one day is selected for edit mode
  onDaySelectionChange(selectedIndex: number) {
    if (this.isEditMode) {
      // For edit mode, only allow one day selection
      this.daysFormArray.controls.forEach((control, index) => {
        if (index !== selectedIndex) {
          control.patchValue({ isSelected: false });
        }
      });
    }
  }

  loadTimeTables() {
    this.loading = true;
    this.timeShiftService.getAllTimeTables().subscribe({
      next: (res) => {
        if (res.succeeded) {
          this.timeTables = res.data ?? [];
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: res.message || 'Failed to load time tables'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load time tables'
        });
        this.loading = false;
      }
    });
  }

  loadShifts() {
    this.loading = true;
    this.timeShiftService.getAllShifts().subscribe({
      next: (res) => {
        if (res.succeeded) {
          this.shifts = res.data ?? [];
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: res.message || 'Failed to load shifts'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load shifts'
        });
        this.loading = false;
      }
    });
  }

  /** ✅ When Save is clicked */
  onSubmit() {
    if (this.timeShiftForm.invalid) {
      this.timeShiftForm.markAllAsTouched();
      return;
    }

    const daysArray = this.timeShiftForm.value.days;
    const selectedDays = daysArray
      .filter((day: any) => day.isSelected)
      .map((day: any) => day.dayNumber);

    if (selectedDays.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select at least one day.'
      });
      return;
    }

    this.loading = true;

    if (this.isEditMode) {
      this.updateTimeShifts(selectedDays);
    } else {
      this.createTimeShifts(selectedDays);
    }
  }

  private createTimeShifts(selectedDays: number[]) {
    const createObservables: Observable<any>[] = [];

    selectedDays.forEach(dayNum => {
      const payload: CreateTimeShift = {
        shiftId: this.timeShiftForm.value.shiftId,
        timeTableId: this.timeShiftForm.value.timeTableId,
        dayNumber: dayNum
      };

      createObservables.push(this.timeShiftService.create(payload));
    });

    forkJoin(createObservables).subscribe({
      next: (responses) => {
        const successful = responses.filter(res => res.succeeded);
        const failed = responses.filter(res => !res.succeeded);

        if (successful.length > 0) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `${successful.length} time shift${successful.length > 1 ? 's' : ''} created successfully`
          });
        }

        if (failed.length > 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Partial Success',
            detail: `${failed.length} time shift${failed.length > 1 ? 's' : ''} failed to create`
          });
        }

        this.handleSaveComplete();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create time shifts'
        });
        this.handleSaveComplete();
      }
    });
  }

  private updateTimeShifts(selectedDays: number[]) {
    // For edit mode, we typically update one record
    const dayNum = selectedDays[0]; // Take the first selected day
    const payload: UpdateTimeShift = {
      id: this.timeShift.id,
      shiftId: this.timeShiftForm.value.shiftId,
      timeTableId: this.timeShiftForm.value.timeTableId,
      dayNumber: dayNum
    };

    this.timeShiftService.update(this.timeShift.id, payload).subscribe({
      next: (res) => {
        if (res.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Time shift updated successfully'
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: res.message || 'Failed to update time shift'
          });
        }
        this.handleSaveComplete();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update time shift'
        });
        this.handleSaveComplete();
      }
    });
  }

  private handleSaveComplete() {
    this.loading = false;
    this.onSave.emit(); // Notify parent that save is complete
    this.closeDialog();
  }

  private getDayName(dayNumber: number): string {
    const dayMap: { [key: number]: string } = {
      1: 'Sunday',
      2: 'Monday', 
      3: 'Tuesday',
      4: 'Wednesday',
      5: 'Thursday',
      6: 'Friday',
      7: 'Saturday'
    };
    return dayMap[dayNumber] || '';
  }

  /** ✅ Close dialog properly */
  closeDialog() {
    this.dialogVisible = false;
    this.dialogVisibleChange.emit(false);
    this.resetForm();
  }

  onCancel() {
    this.closeDialog();
  }

  resetForm() {
    this.timeShiftForm.reset();
    this.initializeDaysFormArray();
  }
}