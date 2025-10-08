import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { LocationService } from '../location.service';
import { Location } from '../../../interfaces/location.interface';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { LocationModalComponent } from '../location-modal/location-modal.component';
import { Organization } from '../../../interfaces/organization.interface';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    TableModule,
    TooltipModule,
    LocationModalComponent
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="card">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Locations</h2>
        <div class="flex-grow-1"></div>
        <button 
          pButton 
          label="Add Location"
          icon="pi pi-plus" 
          class="p-button-sm"
          (click)="openAddModal()">
        </button>
      </div>
      
      <p-table
        #dt
        [value]="locations"
        dataKey="id"
        [rows]="10"
        [loading]="loading"
        [rowHover]="true"
        [showGridlines]="true"
        [paginator]="true"
        [globalFilterFields]="['code', 'name', 'nameSE']"
        responsiveLayout="scroll">
        
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-column sm:flex-row">
            <button 
              pButton 
              label="Clear"
              class="p-button-outlined mb-2" 
              icon="pi pi-filter-slash" 
              (click)="clear(dt)">
            </button>
            <p-iconfield iconPosition="left" class="ml-auto">
              <p-inputicon>
                <i class="pi pi-search"></i>
              </p-inputicon>
              <input 
                pInputText 
                type="text" 
                #filter
                (input)="onGlobalFilter(dt, $event)" 
                placeholder="Search locations..."/>
            </p-iconfield>
          </div>
        </ng-template>

        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="code">
              Code
              <p-sortIcon field="code"></p-sortIcon>
            </th>
            <th pSortableColumn="name">
              Name
              <p-sortIcon field="name"></p-sortIcon>
            </th>
            <th>Actions</th>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="body" let-location>
          <tr>
            <td>{{ location.code }}</td>
            <td>{{ location.name }}</td>
            <td>
              <div class="action-buttons">
                <button 
                  pButton 
                  icon="pi pi-pencil" 
                  class="p-button-rounded p-button-text p-button-sm"
                  (click)="openEditModal(location)"
                  pTooltip="Edit"
                  tooltipPosition="top">
                </button>
                <button 
                  pButton 
                  icon="pi pi-trash" 
                  class="p-button-rounded p-button-text p-button-danger p-button-sm"
                  (click)="deleteLocation(location)"
                  pTooltip="Delete"
                  tooltipPosition="top">
                </button>
              </div>
            </td>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="emptymessage">
          <tr>
            <td [attr.colspan]="isSuperAdmin ? 5 : 4">No locations found</td>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="loadingbody">
          <tr>
            <td [attr.colspan]="isSuperAdmin ? 5 : 4">Loading...</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Location Modal -->
    <app-location-modal
      [(dialogVisible)]="showModal"
      [isEditMode]="isEditMode"
      [location]="selectedLocation"
      [organizations]="organizations"
      [parentLocations]="locations"
      [isSuperAdmin]="isSuperAdmin"
      [loading]="modalLoading"
      (onSave)="onLocationSaved($event)"
      (onCancelEvent)="onModalCancel()">
    </app-location-modal>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `,
    styleUrls: ['./location-list.component.scss'] // Add this line

})
export class LocationListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild('filter') filter!: ElementRef;

  locations: Location[] = [];
  organizations: Organization[] = [];
  loading: boolean = true;
  showModal: boolean = false;
  isEditMode: boolean = false;
  selectedLocation: Location | null = null;
  modalLoading: boolean = false;
  isSuperAdmin: boolean = false;
  private translations: any = {};

  constructor(
    private locationService: LocationService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private translationService: TranslationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });
    
    this.isSuperAdmin = this.checkIsSuperAdmin();
    this.loadLocations();
    this.loadOrganizations();
  }

  loadLocations(): void {
    this.loading = true;
    this.locationService.getAllLocations().subscribe({
      next: (response: ApiResponse<Location[]>) => {
        if (response.succeeded) {
          this.locations = response.data || [];
        } else {
          this.showToast('error', this.translations.common?.error, response.message || this.translations.locationList?.messages?.loadError);
        }
        this.loading = false;
      },
      error: (error) => {
        this.showToast('error', this.translations.common?.error, this.translations.locationList?.messages?.loadError);
        this.loading = false;
      }
    });
  }

  loadOrganizations(): void {
    if (this.isSuperAdmin) {
      // Load organizations for super admin using the lookup service
      this.locationService.getOrganizations().subscribe({
        next: (response: ApiResponse<Organization[]>) => {
          if (response.succeeded) {
            this.organizations = response.data || [];
          }
        },
        error: (error) => {
          console.error('Error loading organizations:', error);
        }
      });
    }
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedLocation = null;
    this.showModal = true;
  }

  openEditModal(location: Location): void {
    this.isEditMode = true;
    
    if (!location.hasOwnProperty('indexValue') || location.indexValue === undefined) {
      this.modalLoading = true;
      this.locationService.getLocationById(location.id).subscribe({
        next: (response: ApiResponse<Location>) => {
          if (response.succeeded && response.data) {
            this.selectedLocation = response.data;
          } else {
            this.selectedLocation = location;
            this.showToast('error', this.translations.common?.error, 'Failed to load complete location data');
          }
          this.modalLoading = false;
          this.showModal = true;
        },
        error: (error) => {
          this.selectedLocation = location;
          this.modalLoading = false;
          this.showModal = true;
          this.showToast('error', this.translations.common?.error, 'Failed to load location details');
        }
      });
    } else {
      this.selectedLocation = location;
      this.showModal = true;
    }
  }

  onLocationSaved(location: Location): void {
    if (this.isEditMode) {
      // Update existing location in the list
      const index = this.locations.findIndex(l => l.id === location.id);
      if (index !== -1) {
        this.locations[index] = { ...this.locations[index], ...location };
      }
    } else {
      // Add new location to the list
      this.locations.unshift(location);
    }
    this.showModal = false;
  }

  onModalCancel(): void {
    this.showModal = false;
  }

  deleteLocation(location: Location): void {
    this.confirmationService.confirm({
      message: this.translations.locationList?.messages?.deleteConfirm || `Are you sure you want to delete ${location.name}?`,
      header: this.translations.locationList?.messages?.deleteTitle || 'Delete Location',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.locationService.deleteLocation(location.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.locations = this.locations.filter(l => l.id !== location.id);
              this.showToast('success', this.translations.common?.success, this.translations.locationList?.messages?.deleteSuccess || 'Location deleted successfully');
            } else {
              this.showToast('error', this.translations.common?.error, response.message || this.translations.locationList?.messages?.deleteError);
            }
          },
          error: (error) => {
            this.showToast('error', this.translations.common?.error, this.translations.locationList?.messages?.deleteError);
          }
        });
      }
    });
  }

  onGlobalFilter(table: Table, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }

  clear(table: Table): void {
    table.clear();
    if (this.filter?.nativeElement) {
      this.filter.nativeElement.value = '';
    }
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

  private checkIsSuperAdmin(): boolean {
    const claims = this.authService.getClaims();
    return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
  }
}

