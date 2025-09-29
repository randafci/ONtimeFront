import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { RamadanPeriod, CreateRamadanPeriod, EditRamadanPeriod } from '../../../interfaces/ramadan-period.interface';
import { RamadanPeriodService } from '../RamadanPeriodService';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-ramadan-period-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    TranslatePipe
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
  private translations: any = {};

  constructor(
    private fb: FormBuilder,
    private ramadanPeriodService: RamadanPeriodService,
    private messageService: MessageService,
    private translationService: TranslationService
  ) {
    this.ramadanPeriodForm = this.createForm();
  }

  ngOnInit() {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });
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
      this.ramadanPeriodForm.patchValue({
        ...this.ramadanPeriod,
        start: this.formatDateForInput(new Date(this.ramadanPeriod.start)),
        end: this.formatDateForInput(new Date(this.ramadanPeriod.end))
      });
    }
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
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
    const data = {
      ...formData,
      start: new Date(formData.start).toISOString(),
      end: new Date(formData.end).toISOString()
    };

    if (this.isEditMode) {
      this.updateRamadanPeriod(data);
    } else {
      this.createRamadanPeriod(data);
    }
  }

  createRamadanPeriod(data: CreateRamadanPeriod): void {
    this.ramadanPeriodService.createRamadanPeriod(data).subscribe({
      next: (response: ApiResponse<RamadanPeriod>) => this.handleSuccess(response, 'createSuccess'),
      error: () => this.handleError('createError')
    });
  }

  updateRamadanPeriod(data: EditRamadanPeriod): void {
    this.ramadanPeriodService.updateRamadanPeriod(this.ramadanPeriod!.id, data).subscribe({
      next: (response: ApiResponse<RamadanPeriod>) => this.handleSuccess(response, 'updateSuccess'),
      error: () => this.handleError('updateError')
    });
  }

  private handleSuccess(response: ApiResponse<RamadanPeriod>, messageKey: string): void {
    this.showToast('success', this.translations.common?.success, this.translations.ramadanPeriodForm?.toasts[messageKey]);
    this.onSave.emit(response.data);
    this.closeDialog();
  }

  private handleError(messageKey: string): void {
    this.showToast('error', this.translations.common?.error, this.translations.ramadanPeriodForm?.toasts[messageKey]);
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
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
      if (control instanceof FormGroup) this.markFormGroupTouched(control);
    });
  }
}
