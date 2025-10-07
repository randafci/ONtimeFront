import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { DaySelection, TimeShift } from '@/interfaces/time-shift.interface';
import { MessageService } from 'primeng/api';
import { forkJoin, Observable } from 'rxjs';
import { TimeShiftService } from '@/pages/timeShift/timeShift.service';
import { TimeTableService } from '../TimeTableService';
import { Shift } from '@/interfaces/employee-shift-assignment.interface';
import { TimeTable } from '@/interfaces/timetable.interface';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-add-or-edit-time-shift',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    SelectModule, // Changed from SelectModule to DropdownModule
    CheckboxModule,
    ButtonModule,
    TranslatePipe
  ],
  templateUrl: './add-or-edit-time-shift.html',
  styleUrls: ['./add-or-edit-time-shift.scss']
})
export class AddOrEditTimeShift implements OnInit, OnChanges {
  /** ✅ Two-way binding */
  @Input() dialogVisible = false;
  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  
  private _timeShift: any = null;
  
  @Input() 
  set timeShift(value: any) {
    console.log('🔄 timeShift SETTER called with:', value);
    this._timeShift = value;
    // If we have data loaded, patch immediately
    if (this.timeTables.length > 0 && value) {
      console.log('🎯 Patching form from setter');
      this.patchFormValues();
    }
  }
  get timeShift(): any {
    return this._timeShift;
  }

  /** ✅ Other inputs */
  @Input() isEditMode = false;
  @Input() loading = false;
  @Output() onSave = new EventEmitter<void>();

  timeShiftForm!: FormGroup;
  timeTables: TimeTable[] = [];
  shifts: Shift[] = [];

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
    private messageService: MessageService,
    private timeTableService: TimeTableService
  ) {}

  ngOnInit(): void {
    console.log('🏁 AddOrEditTimeShift ngOnInit');
    console.log('Initial dialogVisible:', this.dialogVisible);
    console.log('Initial timeShift:', this.timeShift);
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('🔔 ngOnChanges triggered:', {
      dialogVisible: changes['dialogVisible'],
      timeShift: changes['timeShift']
    });

    if (changes['dialogVisible'] && this.dialogVisible) {
      console.log('📂 Dialog opened - loading data');
      this.loadAllData();
    }
  }

  private initForm() {
    this.timeShiftForm = this.fb.group({
      timeTableId: [null, Validators.required],
      shiftId: [null, Validators.required],
      days: this.fb.array([])
    });
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

  private loadAllData() {
    this.loading = true;
    console.log('🔄 Loading TimeTables and Shifts...');
    console.log('📤 Current timeShift:', this.timeShift);
    
    forkJoin({
      timeTables: this.timeTableService.getAllTimeTables(),
      shifts: this.timeShiftService.getAllShifts()
    }).subscribe({
      next: (results) => {
        console.log('✅ Data loaded successfully:');
        console.log('- TimeTables:', results.timeTables.data?.length || 0);
        console.log('- Shifts:', results.shifts.data?.length || 0);

        // Load TimeTables
        if (results.timeTables.succeeded) {
          this.timeTables = results.timeTables.data ?? [];
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: results.timeTables.message || 'Failed to load time tables'
          });
        }

        // Load Shifts
        if (results.shifts.succeeded) {
          this.shifts = results.shifts.data ?? [];
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: results.shifts.message || 'Failed to load shifts'
          });
        }

        this.loading = false;
        
        // ✅ ALWAYS try to patch after data is loaded
        console.log('🎯 Attempting to patch form after data load');
        console.log('timeShift exists:', !!this.timeShift);
        console.log('timeTables loaded:', this.timeTables.length);
        
        if (this.timeShift) {
          this.patchFormValues();
        }
      },
      error: (error) => {
        console.error('❌ Error loading data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load data'
        });
        this.loading = false;
      }
    });
  }

  private patchFormValues() {
    console.log('🛠️ patchFormValues called');
    console.log('timeShift:', this.timeShift);
    console.log('timeTables count:', this.timeTables.length);
    console.log('shifts count:', this.shifts.length);

    if (!this.timeShift) {
      console.log('⚠️ No timeShift provided - this is a CREATE operation');
      return;
    }

    if (this.timeTables.length === 0) {
      console.log('⚠️ TimeTables not loaded yet - cannot patch');
      return;
    }

    console.log('📝 Patching form with values:', {
      timeTableId: this.timeShift.timeTableId,
      shiftId: this.timeShift.shiftId
    });

    // Patch basic form values
    this.timeShiftForm.patchValue({
      timeTableId: this.timeShift.timeTableId,
      shiftId: this.timeShift.shiftId
    });

    // Verify the patch worked
    console.log('✅ Form values after patch:', {
      formTimeTableId: this.timeShiftForm.get('timeTableId')?.value,
      formShiftId: this.timeShiftForm.get('shiftId')?.value
    });

    // Update days form array - only if we have dayNumber
    if (this.timeShift.dayNumber !== null && this.timeShift.dayNumber !== undefined) {
      console.log('📅 Patching days with dayNumber:', this.timeShift.dayNumber);
      const daysArray = this.daysFormArray;
      this.days.forEach((day, index) => {
        const isSelected = day.dayNumber === this.timeShift.dayNumber;
        daysArray.at(index).patchValue({
          isSelected: isSelected,
          isWeekend: this.timeShift.isWeekend || false
        });
      });
    } else {
      console.log('📅 No dayNumber provided - skipping days patch');
    }
  }

  get daysFormArray(): FormArray {
    return this.timeShiftForm.get('days') as FormArray;
  }

  getDayFormGroup(index: number): FormGroup {
    return this.daysFormArray.at(index) as FormGroup;
  }

  onDaySelectionChange(selectedIndex: number) {
    if (this.isEditMode) {
      this.daysFormArray.controls.forEach((control, index) => {
        if (index !== selectedIndex) {
          control.patchValue({ isSelected: false });
        }
      });
    }
  }

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
      const payload: TimeShift = {
        id: 0,
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
    const dayNum = selectedDays[0];
    const payload: TimeShift = {
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
    this.onSave.emit();
    this.closeDialog();
  }

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
    // Clear loaded data when dialog closes
    this.timeTables = [];
    this.shifts = [];
  }
}