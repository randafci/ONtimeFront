import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { RamadanPeriod, CreateRamadanPeriod, EditRamadanPeriod } from '@/interfaces/ramadan-period.interface';
import { RamadanPeriodService } from '../RamadanPeriodService';
import { ApiResponse } from '@/core/models/api-response.model';
import { AuthService } from '@/auth/auth.service';

@Component({
  selector: 'app-ramadan-period-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
  ],
  providers: [MessageService],
  templateUrl: './ramadan-period-modal.component.html',
})
export class RamadanPeriodModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() ramadanPeriod: RamadanPeriod | null = null;
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<RamadanPeriod>();
  @Output() onCancelEvent = new EventEmitter<void>();

  ramadanPeriodForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ramadanPeriodService: RamadanPeriodService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.ramadanPeriodForm = this.createForm();
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.dialogVisible && this.ramadanPeriod) {
      this.loadRamadanPeriodData();
    } else if (this.dialogVisible && !this.isEditMode) {
      this.resetForm();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      nameSE: ['', Validators.required],
      start: [null, Validators.required],
      end: [null, Validators.required]
    });
  }

  loadRamadanPeriodData(): void {
    if (this.ramadanPeriod) {
      const startDate = new Date(this.ramadanPeriod.start);
      const endDate = new Date(this.ramadanPeriod.end);
      
      this.ramadanPeriodForm.patchValue({
        code: this.ramadanPeriod.code,
        name: this.ramadanPeriod.name,
        nameSE: this.ramadanPeriod.nameSE,
        start: this.formatDateForInput(startDate),
        end: this.formatDateForInput(endDate)
      });
    }
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  resetForm(): void {
    this.ramadanPeriodForm.reset();
  }

  onSubmit(): void {
    if (this.ramadanPeriodForm.invalid) {
      this.markFormGroupTouched(this.ramadanPeriodForm);
      return;
    }

    const formData = this.ramadanPeriodForm.value;

    if (this.isEditMode) {
      const editData: EditRamadanPeriod = {
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        start: new Date(formData.start).toISOString(),
        end: new Date(formData.end).toISOString()
      };
      this.updateRamadanPeriod(editData);
    } else {
      const createData: CreateRamadanPeriod = {
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        start: new Date(formData.start).toISOString(),
        end: new Date(formData.end).toISOString()
      };
      this.createRamadanPeriod(createData);
    }
  }

  createRamadanPeriod(data: CreateRamadanPeriod): void {
    this.ramadanPeriodService.createRamadanPeriod(data).subscribe({
      next: (response: ApiResponse<RamadanPeriod>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Ramadan period created successfully'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create ramadan period'
        });
      }
    });
  }

  updateRamadanPeriod(data: EditRamadanPeriod): void {
    this.ramadanPeriodService.updateRamadanPeriod(this.ramadanPeriod!.id, data).subscribe({
      next: (response: ApiResponse<RamadanPeriod>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Ramadan period updated successfully'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update ramadan period'
        });
      }
    });
  }

  onDialogHide(): void {
    this.closeDialog();
  }

  closeDialog(): void {
    this.dialogVisibleChange.emit(false);
  }

  onCancel(): void {
    this.closeDialog();
    this.onCancelEvent.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
