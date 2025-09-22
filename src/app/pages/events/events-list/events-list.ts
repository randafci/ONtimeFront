import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';

import { ConfirmationService, MessageService } from 'primeng/api';
import { Events, CreateEvents, EditEvents } from '@/interfaces/events.interface';
import { EventsService } from '../EventsService';
import { LookupService } from '../../organization/OrganizationService';
import { Organization } from '@/interfaces/organization.interface';
import { Location } from '@/interfaces/location.interface';
import { LocationService } from '../../location/location.service';
import { Router, RouterModule } from "@angular/router";
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { TranslationService } from '@/pages/translation-manager/translation-manager/translation.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { AuthService } from '@/auth/auth.service';
import { EventsModalComponent } from '../events-modal/events-modal.component';


@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    ConfirmDialogModule,
    DialogModule,
    RouterModule,
    DatePipe,
    TranslatePipe,
    EventsModalComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './events-list.html',
  styleUrl: './events-list.scss'
})
export class EventsListComponent implements OnInit {
  events: Events[] = [];
  loading: boolean = true;

  statuses: any[] = []; 

  activityValues: number[] = [0, 100];

  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  selectedEvent: Events | null = null;
  eventsForm: FormGroup;
  organizations: Organization[] = [];
  locations: Location[] = [];
  isSuperAdmin = false;

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  
  private translations: any = {};

  constructor(
    private eventsService: EventsService,
    private organizationService: LookupService,
    private locationService: LocationService,
    private messageService: MessageService,
    private router: Router,
    private translationService: TranslationService, 
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.eventsForm = this.createForm();
  }

  ngOnInit() {
    this.isSuperAdmin = this.checkIsSuperAdmin();
    
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.eventsForm.patchValue({ organizationId: +orgId });
      }
    }

    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
      this.statuses = [
        { label: translations.eventsList?.statusValues?.active || 'Active', value: 'active' },
        { label: translations.eventsList?.statusValues?.inactive || 'Inactive', value: 'inactive' }
      ];
    });

    this.loadEvents();
    this.loadOrganizations();
    this.loadLocations();
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      code: ['', Validators.required],
      name: ['', Validators.required],
      nameSE: ['', Validators.required],
      organizationId: [null, Validators.required],
      start: [null],
      end: [null],
      locationId: [null]
    });
  }

  private checkIsSuperAdmin(): boolean {
    const claims = this.authService.getClaims();
    return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
  }

  loadOrganizations(): void {
    this.organizationService.getAllOrganizations().subscribe({
      next: (response: ApiResponse<Organization[]>) => {
        if (response.succeeded) {
          this.organizations = response.data||[];
        }
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
      }
    });
  }

  loadLocations(): void {
    this.locationService.getAllLocations().subscribe({
      next: (response: ApiResponse<Location[]>) => {
        if (response.succeeded) {
          this.locations = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error loading locations:', error);
      }
    });
  }

  loadEvents() {
    this.loading = true;
    this.eventsService.getAllEvents().subscribe({
      next: (response: ApiResponse<Events[]>) => {
        if (response.succeeded) {
          this.events = response.data||[];
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.translations.common?.error || 'Error',
            detail: response.message || this.translations.eventsList?.messages?.loadError
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
          detail: this.translations.eventsList?.messages?.loadError
        });
        this.loading = false;
      }
    });
  }

  getStatus(event: Events): string {
    return event.isDeleted ? 'inactive' : 'active';
  }

  getSeverity(status: string) {
    if (!status) return 'info';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'danger';
      default:
        return 'info';
    }
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.selectedEvent = null;
    this.eventsForm.reset();
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.eventsForm.patchValue({ organizationId: +orgId });
      }
    }
    this.dialogVisible = true;
  }

  openEditDialog(event: Events) {
    this.isEditMode = true;
    this.selectedEvent = event;
    this.eventsForm.patchValue({
      id: event.id,
      code: event.code,
      name: event.name,
      nameSE: event.nameSE,
      organizationId: event.organizationId,
      start: event.start ? this.formatDateForInput(event.start) : null,
      end: event.end ? this.formatDateForInput(event.end) : null,
      locationId: event.locationId
    });
    this.dialogVisible = true;
  }

  onEventsSaved(events: Events) {
    this.loadEvents();
  }

  closeDialog() {
    this.dialogVisible = false;
    this.selectedEvent = null;
    this.eventsForm.reset();
  }

  onSubmit(): void {
    if (this.eventsForm.invalid) {
      this.markFormGroupTouched(this.eventsForm);
      return;
    }

    this.loading = true;
    const formData = this.eventsForm.value;

    if (this.isEditMode) {
      const editData: EditEvents = {
        id: formData.id,
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        organizationId: formData.organizationId,
        start: formData.start || null,
        end: formData.end || null,
        locationId: formData.locationId
      };
      this.updateEvent(editData);
    } else {
      const createData: CreateEvents = {
        code: formData.code,
        name: formData.name,
        nameSE: formData.nameSE,
        organizationId: formData.organizationId,
        start: formData.start || null,
        end: formData.end || null,
        locationId: formData.locationId
      };
      this.createEvent(createData);
    }
  }

  createEvent(data: CreateEvents): void {
    this.eventsService.createEvents(data).subscribe({
      next: (response: ApiResponse<Events>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Event created successfully'
        });
        this.closeDialog();
        this.loadEvents();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create event'
        });
        this.loading = false;
      }
    });
  }

  updateEvent(data: EditEvents): void {
    this.eventsService.updateEvents(data).subscribe({
      next: (response: ApiResponse<Events>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Event updated successfully'
        });
        this.closeDialog();
        this.loadEvents();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update event'
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

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  deleteEvents(event: Events) {
    const message = (this.translations.eventsList?.messages?.deleteConfirm || 'Are you sure you want to delete {name}?')
                    .replace('{name}', event.name);

    this.confirmationService.confirm({
      message: message,
      header: this.translations.eventsList?.messages?.deleteHeader || 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.eventsService.deleteEvents(event.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Event ${event.name} deleted successfully`
              });
              this.loadEvents();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || 'Failed to delete event'
              });
            }
          },
          error: (error) => {
            console.error('Error deleting event:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete event'
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
