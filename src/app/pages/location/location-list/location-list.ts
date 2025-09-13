

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';

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

import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { TranslationService } from '@/pages/translation-manager/translation-manager/translation.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { Location } from '@/interfaces/location.interface';
import { LocationService } from '../location.service';
import { ConfirmDialog } from "primeng/confirmdialog";

@Component({
  selector: 'app-location-list',
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
    RouterModule,
    DatePipe,
    TranslatePipe,
    ConfirmDialog
],
  providers: [MessageService, ConfirmationService],
  templateUrl: './location-list.html',
  styleUrl: './location-list.scss'
})
export class LocationList implements OnInit {
  locations: Location[] = [];
  loading: boolean = true;

  statuses: any[] = [];
  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  private translations: any = {};

  constructor(
    private locationService: LocationService,
    private messageService: MessageService,
    private router: Router,
    private translationService: TranslationService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
      this.statuses = [
        { label: translations.locationList?.statusValues?.active || 'Active', value: 'active' },
        { label: translations.locationList?.statusValues?.inactive || 'Inactive', value: 'inactive' }
      ];
    });

    this.loadLocations();
  }

  loadLocations() {
    this.loading = true;
    this.locationService.getAllLocations().subscribe({
      next: (response: ApiResponse<Location[]>) => {
        if (response.succeeded) {
          this.locations = response.data || [];
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.translations.common?.error || 'Error',
            detail: response.message || this.translations.locationList?.messages?.loadError
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading locations:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
          detail: this.translations.locationList?.messages?.loadError
        });
        this.loading = false;
      }
    });
  }

  getStatus(location: Location): string {
    // if you add isDeleted later, change here
    return location.organizationId ? 'active' : 'inactive';
  }

  getSeverity(status: string) {
    if (!status) return 'info';
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      default: return 'info';
    }
  }

  navigateToAdd() {
    this.router.navigate(['/locations/add']);
  }

  navigateToEdit(id: number) {
    this.router.navigate(['/locations/edit', id]);
  }

deleteLocation(location: Location) {
  const message = (this.translations.locationList?.messages?.deleteConfirm || 'Are you sure you want to delete ${name}?')
                  .replace('${name}', location.name);

  this.confirmationService.confirm({
    message: message,
    header: this.translations.locationList?.messages?.deleteHeader || 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.locationService.deleteLocation(location.id).subscribe({
        next: (res) => {
          if (res.succeeded) {  // ✅ fixed here
            this.messageService.add({
              severity: 'success',
              summary: this.translations.common?.success || 'Success',
              detail: this.translations.locationList?.messages?.deleteSuccess || 'Location deleted successfully'
            });
            this.loadLocations();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translations.common?.error || 'Error',
              detail: res.message || this.translations.locationList?.messages?.deleteError
            });
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: this.translations.common?.error || 'Error',
            detail: this.translations.locationList?.messages?.deleteError || 'Something went wrong'
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
  
}
