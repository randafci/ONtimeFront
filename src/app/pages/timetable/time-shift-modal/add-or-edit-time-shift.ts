import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormArray, AbstractControl } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { DaySelection, GroupedTimeShift, TimeShift, UpdateTimeShift } from '@/interfaces/time-shift.interface';
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
    SelectModule,
    CheckboxModule,
    ButtonModule,
    TranslatePipe,
    
],
  templateUrl: './add-or-edit-time-shift.html',
  styleUrls: ['./add-or-edit-time-shift.scss']
})
export class AddOrEditTimeShift implements OnInit, OnChanges {
  /** ✅ Two-way binding */
  @Input() dialogVisible = false;
  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  
  private _timeShift: any = null;
groupedTimeShifts: any;
activeAccordionIndex: number | null = null;
allDays = [
  { dayNumber: 1, name: 'Sunday' },
  { dayNumber: 2, name: 'Monday' },
  { dayNumber: 3, name: 'Tuesday' },
  { dayNumber: 4, name: 'Wednesday' },
  { dayNumber: 5, name: 'Thursday' },
  { dayNumber: 6, name: 'Friday' },
  { dayNumber: 7, name: 'Saturday' },
];
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
    { dayName: 'Sunday', dayNumber: 1, isSelected: false, isWeekend: false , timeShiftId : 0},
    { dayName: 'Monday', dayNumber: 2, isSelected: false, isWeekend: false, timeShiftId : 0 },
    { dayName: 'Tuesday', dayNumber: 3, isSelected: false, isWeekend: false , timeShiftId : 0},
    { dayName: 'Wednesday', dayNumber: 4, isSelected: false, isWeekend: false , timeShiftId : 0},
    { dayName: 'Thursday', dayNumber: 5, isSelected: false, isWeekend: false , timeShiftId : 0},
    { dayName: 'Friday', dayNumber: 6, isSelected: false, isWeekend: true , timeShiftId : 0},
    { dayName: 'Saturday', dayNumber: 7, isSelected: false, isWeekend: false, timeShiftId : 0}
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
      days: this.fb.array([], this.daysArrayValidator.bind(this))
    });
    this.initializeDaysFormArray();
  }

  private initializeDaysFormArray() {
    const daysArray = this.timeShiftForm.get('days') as FormArray;
    daysArray.clear();
    
    this.days.forEach(day => {
      const dayGroup = this.fb.group({
        dayName: [day.dayName],
        dayNumber: [day.dayNumber],
        isSelected: [day.isSelected],
        isWeekend: [day.isWeekend]
      });

      // Add change listeners for validation
      dayGroup.get('isSelected')?.valueChanges.subscribe(() => {
        this.validateDaySelection(dayGroup);
      });

      dayGroup.get('isWeekend')?.valueChanges.subscribe(() => {
        this.validateDaySelection(dayGroup);
      });

      daysArray.push(dayGroup);
    });
  }

  /** ✅ Custom validator for days array */
  private daysArrayValidator(control: AbstractControl) {
    const daysArray = control as FormArray;
    let hasError = false;

    for (let i = 0; i < daysArray.length; i++) {
      const dayGroup = daysArray.at(i) as FormGroup;
      const isSelected = dayGroup.get('isSelected')?.value;
      const isWeekend = dayGroup.get('isWeekend')?.value;

      if (isSelected && isWeekend) {
        hasError = true;
        break;
      }
    }

    return hasError ? { conflictingSelection: true } : null;
  }

  /** ✅ Validate individual day selection */
  private validateDaySelection(dayGroup: FormGroup) {
    const isSelected = dayGroup.get('isSelected')?.value;
    const isWeekend = dayGroup.get('isWeekend')?.value;

    if (isSelected && isWeekend) {
      // If both are true, show error and auto-correct by unchecking isSelected
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'A day cannot be both selected and marked as weekend. The selection has been cleared.',
        life: 5000
      });
      
      // Auto-correct: uncheck isSelected
      dayGroup.patchValue({ isSelected: false }, { emitEvent: false });
    }

    // Update the form validity
    this.timeShiftForm.updateValueAndValidity();
  }

  /** ✅ Check if any day has both isSelected and isWeekend true */
  hasConflictingDays(): boolean {
    const daysArray = this.daysFormArray.value;
    return daysArray.some((day: any) => day.isSelected && day.isWeekend);
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
    if (this.timeShift.timeTableId) {
  console.log('📞 Calling getByTimeTableId after patch');
  this.getByTimeTableId(this.timeShift.timeTableId);
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

  /** ✅ Handle weekend checkbox change */
 // Handle weekend checkbox change with proper typing
onWeekendChange(day: DaySelection, event: Event) {
  const target = event.target as HTMLInputElement;
  if (day && target) {
    day.isWeekend = target.checked;
    
    // If marking as weekend, automatically uncheck isSelected
    if (target.checked && day.isSelected) {
      day.isSelected = false;
    }
  }
}

  /** ✅ Handle selection checkbox change */
  onSelectionChange(dayIndex: number) {
    const dayGroup = this.getDayFormGroup(dayIndex);
    const isSelected = dayGroup.get('isSelected')?.value;
    
    if (isSelected) {
      // If selecting a day, automatically uncheck isWeekend
      dayGroup.patchValue({ isWeekend: false });
    }

    // Call the existing selection change handler for edit mode
    this.onDaySelectionChange(dayIndex);
  }

  onSubmit() {
    // Check for conflicting days before submission
    if (this.hasConflictingDays()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Cannot save: Some days are both selected and marked as weekend. Please fix the conflicts.',
        life: 5000
      });
      return;
    }

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

getByTimeTableId(eventOrId: Event | number) {
  const timeTableId =
    typeof eventOrId === 'number'
      ? eventOrId
      : Number((eventOrId.target as HTMLSelectElement)?.value);

  if (!timeTableId) return;

  console.log('📡 Calling getByTimeTableId with ID:', timeTableId);

  this.timeShiftService.getByTimeTableId(timeTableId).subscribe({
    next: (res) => {
      if (res.succeeded) {
        console.log('✅ getByTimeTableId response:', res.data);
        
        // Convert backend TimeShift data to frontend DaySelection format
        this.groupedTimeShifts = (res.data ?? []).map((group: GroupedTimeShift) => ({
          ...group,
          daySelections: this.convertTimeShiftsToDaySelection(group.days || [])
        }));
        
        console.log('🔄 Converted groupedTimeShifts:', this.groupedTimeShifts);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: res.message || 'Failed to load shifts for selected TimeTable'
        });
      }
    },
    error: (err) => {
      console.error('❌ getByTimeTableId error:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error loading shifts for selected TimeTable'
      });
    }
  });
}

getTimeTableName(id: number): string {
  const tt = this.timeTables?.find(t => t.id === id);
  return tt ? (tt.nameEn ?? `TimeTable #${id}`) : `TimeTable #${id}`;
}

getShiftName(id: number): string {
  const sh = this.shifts?.find(s => s.id === id);
  return sh ? (sh.shiftTypeName ?? `Shift #${id}`) : `Shift #${id}`;
}


getDayName(dayNumber: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber - 1] || 'Unknown';
}

toggleAccordion(index: number) {
  this.activeAccordionIndex = this.activeAccordionIndex === index ? null : index;
}


isDayWeekend(group: GroupedTimeShift, dayNumber: number): boolean {
  return group.days?.some((d: any) => d.dayNumber === dayNumber && d.isWeekend === true) ?? false;
}

toggleDaySelection(group: any, dayNumber: number, event: Event) {
  const target = event.target as HTMLInputElement;
  const checked = target?.checked;
  
  if (!group || !group.daySelections || dayNumber === undefined) return;
  
  // Find the day in daySelections array
  const dayIndex = group.daySelections.findIndex((d: DaySelection) => d.dayNumber === dayNumber);
  
  if (dayIndex !== -1) {
    // Update the isSelected property
    group.daySelections[dayIndex].isSelected = checked;
    
    // If deselected, clear the timeShiftId since we'll delete the record
    if (!checked) {
      group.daySelections[dayIndex].timeShiftId = undefined;
    }
    
    // Ensure weekend is false when selected
    if (checked) {
      group.daySelections[dayIndex].isWeekend = false;
    }
  }
  
  console.log('Updated group daySelections:', group.daySelections);
}


// Add this method to help debug day data
getDayData(group: GroupedTimeShift, dayNumber: number): any {
  if (!group.days) return null;
  return group.days.find((d: any) => d.dayNumber === dayNumber);
}
updateTimeShift(timeTableId: number, shiftId: number) {
  const group = this.groupedTimeShifts.find((x: any) => 
    x.timeTableId === timeTableId && x.shiftId === shiftId
  );
  
  if (!group) return;

  this.loading = true;

  console.log('🔄 Starting update for group:', { timeTableId, shiftId });
  console.log('📊 Current day selections with IDs:', group.daySelections);

  const updateObservables: Observable<any>[] = [];
  const createObservables: Observable<any>[] = [];
  const deleteObservables: Observable<any>[] = [];

  // Process each day selection directly using the stored timeShiftId
  group.daySelections.forEach((daySelection: DaySelection) => {
    console.log(`📅 Processing day ${daySelection.dayNumber}:`, {
      isSelected: daySelection.isSelected,
      timeShiftId: daySelection.timeShiftId
    });

    if (daySelection.isSelected) {
      // Day should be selected
      if (daySelection.timeShiftId && daySelection.timeShiftId !== 0) {
        // Update existing record using the stored ID (only if ID is not 0)
        const dto: UpdateTimeShift = {
          id: daySelection.timeShiftId,
          timeTableId: timeTableId,
          shiftId: shiftId,
          dayNumber: daySelection.dayNumber
        };
        console.log(`🔄 Updating existing record:`, dto);
        updateObservables.push(this.timeShiftService.update(daySelection.timeShiftId, dto));
      } else {
        // Create new record if no ID exists or ID is 0
        const payload: TimeShift = {
          id: 0,
          timeTableId: timeTableId,
          shiftId: shiftId,
          dayNumber: daySelection.dayNumber
        };
        console.log(`➕ Creating new record:`, payload);
        createObservables.push(this.timeShiftService.create(payload));
      }
    } else {
      // Day should NOT be selected - delete if ID exists and is not 0
      if (daySelection.timeShiftId && daySelection.timeShiftId !== 0) {
        console.log(`🗑️ Deleting record with ID:`, daySelection.timeShiftId);
        deleteObservables.push(this.timeShiftService.delete(daySelection.timeShiftId));
      }
      // If no ID exists or ID is 0, do nothing
    }
  });

  console.log('📤 Operations to execute:', {
    updates: updateObservables.length,
    creates: createObservables.length,
    deletes: deleteObservables.length
  });

  const allOperations = [...updateObservables, ...createObservables, ...deleteObservables];

  if (allOperations.length === 0) {
    this.loading = false;
    this.messageService.add({
      severity: 'info',
      summary: 'No Changes',
      detail: 'No time shifts to update'
    });
    return;
  }

  forkJoin(allOperations).subscribe({
    next: (results) => {
      this.loading = false;
      const successful = results.filter(res => res.succeeded);
      const failed = results.filter(res => !res.succeeded);

      console.log('✅ Update results:', { successful: successful.length, failed: failed.length });

      if (successful.length > 0) {
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: `Time shift updated successfully for ${successful.length} operations`
        });
      }

      if (failed.length > 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Partial Success',
          detail: `${failed.length} operations failed`
        });
      }
      
      // Refresh the data to get updated IDs (especially for newly created records)
      this.getByTimeTableId(timeTableId);
    },
    error: (error) => {
      this.loading = false;
      console.error('❌ Update error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update time shifts'
      });
    }
  });
}
/* updateTimeShift(id: number) {
  const group = this.groupedTimeShifts.find((x: { id: number; }) => x.id === id);
  if (!group) return;

  // Loop through each day in the group
  group.days.forEach((day: { dayNumber: any; }) => {
    const dto: UpdateTimeShift = {
      id: id,
      timeTableId: group.timeTableId,
      shiftId: group.shiftId,
      dayNumber: day.dayNumber 
    };

    this.timeShiftService.update(id, dto).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: `Day ${day.dayNumber} updated successfully`
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Update failed for day ${day.dayNumber}`
        });
      }
    });
  });
} */
convertTimeShiftsToDaySelection(timeShifts: TimeShift[]): DaySelection[] {
  // Start with default days (all unselected)
  const daySelections: DaySelection[] = this.days.map(day => ({
    ...day,
    isSelected: false ,// Reset all to false initially
    timeShiftId: 0 // Add this to store the backend ID

  }));

  // Mark days as selected if they exist in the backend data
  if (timeShifts && timeShifts.length > 0) {
    timeShifts.forEach((timeShift: TimeShift) => {
      const dayIndex = daySelections.findIndex(day => day.dayNumber === timeShift.dayNumber);
      if (dayIndex !== -1) {
        daySelections[dayIndex].isSelected = true;
       daySelections[dayIndex].timeShiftId = timeShift.id; // Store the backend ID

      }
    });
  }

  // Automatically mark non-selected days as weekend
  daySelections.forEach(day => {
    if (!day.isSelected) {
      day.isWeekend = true;
    }
  });

  return daySelections;
}

convertDaySelectionToTimeShifts(daySelections: DaySelection[], timeTableId: number, shiftId: number): TimeShift[] {
  return daySelections
    .filter(day => day.isSelected)
    .map(day => ({
      id: 0, // Will be set by backend for new entries
      timeTableId: timeTableId,
      shiftId: shiftId,
      dayNumber: day.dayNumber
    } as TimeShift)); // Explicitly cast to TimeShift
}

isDayAssigned(group: any, dayNumber: number): boolean {
  if (!group || !group.daySelections) return false;
  
  const day = group.daySelections.find((d: DaySelection) => d.dayNumber === dayNumber);
  return day ? day.isSelected : false;
}



// Add a method to check if day exists in group (for debugging)
isDayInGroup(group: GroupedTimeShift, dayNumber: number): boolean {
  return group.days?.some((d: any) => d.dayNumber === dayNumber) ?? false;
}

toggleAssign(group: any, dayNumber: number, checked: boolean) {
  const existingDay = group.days.find((d: any) => d.dayNumber === dayNumber);

  if (existingDay) {
    existingDay.isSelected = checked;
  } else if (checked) {
    group.days.push({
      dayNumber: dayNumber,
      isSelected: true,
      isWeekend: false
    });
  } else {
    group.days = group.days.filter((d: any) => d.dayNumber !== dayNumber);
  }
}

toggleWeekend(group: any, dayNumber: number, checked: boolean) {
  const existingDay = group.days.find((d: any) => d.dayNumber === dayNumber);

  if (existingDay) {
    existingDay.isWeekend = checked;
  } else if (checked) {
    group.days.push({
      dayNumber: dayNumber,
      isSelected: false,
      isWeekend: true
    });
  }
}
// Add this method to count selected days
getSelectedDaysCount(group: any): number {
  if (!group || !group.daySelections) return 0;
  return group.daySelections.filter((d: any) => d.isSelected).length;
}

}