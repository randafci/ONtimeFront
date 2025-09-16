import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { CountryService } from '../CountryService';
import { Country, CreateCountry, EditCountry } from '../../../interfaces/country.interface';
import { CommonModule } from '@angular/common';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-add-or-edit-country',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToastModule,
    TranslatePipe,
  ],
  templateUrl: './add-or-edit-country.html',
 
  providers: [MessageService, TranslationService]
})
export class AddOrEditCountry implements OnInit {
  countryForm: FormGroup;
  isEditMode = false;
  countryId: string | null = null;
  loading = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private countryService: CountryService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.countryForm = this.fb.group({
      id: ['', [Validators.required, Validators.maxLength(2)]],
      name: ['', Validators.required],
      nameSE: ['', Validators.required],
      nationality: ['', Validators.required],
      nationalitySEName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.countryId = params['id'];
        this.loadCountry(this.countryId!);
      }
    });
  }



  loadCountry(id: string): void {
    this.loading = true;
    this.countryService.getCountryById(id).subscribe({
      next: (response: ApiResponse<Country>) => {
        if (response.succeeded && response.data) {
          this.countryForm.patchValue({
            id: response.data.id,
            name: response.data.name,
            nameSE: response.data.nameSE,
            nationality: response.data.nationality,
            nationalitySEName: response.data.nationalitySEName
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load country data'
        });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.countryForm.invalid) {
      this.markFormGroupTouched(this.countryForm);
      return;
    }

    this.loading = true;
    const formData = this.countryForm.value;

    if (this.isEditMode && this.countryId) {
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
          detail: 'Country created successfully'
        });
        this.router.navigate(['/countries']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create country'
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
          detail: 'Country updated successfully'
        });
        this.router.navigate(['/countries']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update country'
        });
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/countries']);
  }
}
