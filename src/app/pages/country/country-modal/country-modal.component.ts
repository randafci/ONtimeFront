import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Country, CreateCountry, EditCountry } from '../../../interfaces/country.interface';
import { CountryService } from '../CountryService';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-country-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    TranslatePipe
  ],
  providers: [MessageService, TranslatePipe],
  templateUrl: './country-modal.component.html'
})
export class CountryModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() country: Country | null = null;
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<Country>();
  @Output() onCancelEvent = new EventEmitter<void>();

  countryForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private countryService: CountryService,
    private messageService: MessageService
  ) {
    this.countryForm = this.createForm();
  }

  ngOnInit(): void {
    // Initialize form
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dialogVisible'] && this.dialogVisible && this.isEditMode && this.country) {
      this.patchForm(this.country);
    } else if (changes['dialogVisible'] && this.dialogVisible && !this.isEditMode) {
      this.resetFormForCreate();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: ['', [Validators.required, Validators.maxLength(2)]],
      name: ['', Validators.required],
      nameSE: ['', Validators.required],
      nationality: ['', Validators.required],
      nationalitySEName: ['', Validators.required]
    });
  }

  patchForm(country: Country): void {
    this.countryForm.patchValue({
      id: country.id,
      name: country.name,
      nameSE: country.nameSE,
      nationality: country.nationality,
      nationalitySEName: country.nationalitySEName
    });
  }

  resetFormForCreate(): void {
    this.countryForm.reset();
  }

  onSubmit(): void {
    if (this.countryForm.invalid) {
      this.markFormGroupTouched(this.countryForm);
      return;
    }

    this.loading = true;
    const formData = this.countryForm.value;

    if (this.isEditMode) {
      const editData: EditCountry = {
        id: formData.id,
        name: formData.name,
        nameSE: formData.nameSE,
        nationality: formData.nationality,
        nationalitySEName: formData.nationalitySEName
      };
      this.updateCountry(editData);
    } else {
      const createData: CreateCountry = {
        id: formData.id,
        name: formData.name,
        nameSE: formData.nameSE,
        nationality: formData.nationality,
        nationalitySEName: formData.nationalitySEName
      };
      this.createCountry(createData);
    }
  }

  createCountry(data: CreateCountry): void {
    this.countryService.createCountry(data).subscribe({
      next: (response: ApiResponse<Country>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'countryForm.toasts.createSuccess'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'countryForm.toasts.createError'
        });
        this.loading = false;
      }
    });
  }

  updateCountry(data: EditCountry): void {
    this.countryService.updateCountry(data).subscribe({
      next: (response: ApiResponse<Country>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'countryForm.toasts.updateSuccess'
        });
        this.onSave.emit(response.data);
        this.closeDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'countryForm.toasts.updateError'
        });
        this.loading = false;
      }
    });
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

