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
  providers: [MessageService, ConfirmationService],
  templateUrl: './country-list.html'
})
export class CountryListComponent implements OnInit {
  countries: Country[] = [];
  loading: boolean = true;
  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  selectedCountry: Country | null = null;
  private translations: any = {};

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private countryService: CountryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });
    this.loadCountries();
  }

  loadCountries() {
    this.loading = true;
    this.countryService.getAllCountries().subscribe({
      next: (response: ApiResponse<Country[]>) => {
        if (response.succeeded) {
          this.countries = response.data;
        } else {
          this.showToast('error', this.translations.common?.error, this.translations.countryList?.messages?.loadError);
        }
        this.loading = false;
      },
      error: (error) => {
        this.showToast('error', this.translations.common?.error, this.translations.countryList?.messages?.loadError);
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

  deleteCountry(country: Country) {
    const messages = this.translations.countryList?.messages || {};
    const common = this.translations.common || {};
    
    const message = (messages.deleteConfirm || 'Are you sure you want to delete {name}?').replace('{name}', country.name);

    this.confirmationService.confirm({
      message: message,
      header: common.deleteHeader || 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.countryService.deleteCountry(country.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.showToast('success', common.success, messages.deleteSuccess);
              this.loadCountries();
            } else {
              this.showToast('error', common.error, response.message || messages.deleteError);
            }
          },
          error: (error) => {
            this.showToast('error', common.error, messages.deleteError);
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
  
  private showToast(severity: string, summary: string, detail: string): void {
      this.messageService.add({ severity, summary, detail });
  }
}
