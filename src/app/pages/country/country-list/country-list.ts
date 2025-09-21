import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Country } from '../../../interfaces/country.interface';
import { CountryService } from '../CountryService';
import { Router, RouterModule } from "@angular/router";
import { ApiResponse } from '../../../core/models/api-response.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthService } from '../../../auth/auth.service';
import { CountryModalComponent } from '../country-modal/country-modal.component';

@Component({
  selector: 'app-country-list',
  standalone: true,
    imports: [
    CommonModule,
    FormsModule,
    TableModule,
    MultiSelectModule,
    InputTextModule,
    SliderModule,
    ProgressBarModule,
    TagModule,
    ButtonModule,
    InputIconModule,
    IconFieldModule,
    SelectModule,
    ToastModule,
    TooltipModule,
    RouterModule,
    TranslatePipe,
    ConfirmDialogModule,
    CountryModalComponent
  ],
  providers: [MessageService, ConfirmationService, TranslationService],
  templateUrl: './country-list.html'
})
export class CountryListComponent implements OnInit {
  countries: Country[] = [];
  loading: boolean = true;

  // Dialog properties
  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  selectedCountry: Country | null = null;

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private countryService: CountryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCountries();
  }

  loadCountries() {
    this.loading = true;
    this.countryService.getAllCountries().subscribe({
      next: (response: ApiResponse<Country[]>) => {
        if (response.succeeded) {
          this.countries = response.data;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load countries'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load countries'
        });
        this.loading = false;
      }
    });
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.selectedCountry = null;
    this.dialogVisible = true;
  }

  openEditDialog(country: Country) {
    this.isEditMode = true;
    this.selectedCountry = country;
    this.dialogVisible = true;
  }

  onCountrySaved(country: Country) {
    this.loadCountries();
  }

  onCountryModalCancel() {
    // Handle modal cancellation if needed
  }

  deleteCountry(country: Country) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${country.name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.countryService.deleteCountry(country.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Country deleted successfully'
              });
              this.loadCountries();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || 'Failed to delete country'
              });
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete country'
            });
          }
        });
      }
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }

  getIntegrationSeverity(fromIntegration: boolean): string {
    return fromIntegration ? 'success' : 'info';
  }
}
