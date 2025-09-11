import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { EventsService } from '../EventsService';
import { LookupService } from '../../organization/OrganizationService';
import { Events, CreateEvents, EditEvents } from '@/interfaces/events.interface';
import { Organization } from '@/interfaces/organization.interface';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@/pages/translation-manager/translation-manager/translation.service';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { ApiResponse } from '@/core/models/api-response.model';
import { AuthService } from '@/auth/auth.service';

@Component({
  selector: 'app-add-or-edit-events',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToastModule,
    TranslatePipe
  ],
  templateUrl: './add-or-edit-events.html',
  styleUrl: './add-or-edit-events.scss',
  providers: [MessageService]
})
export class AddOrEditEvents implements OnInit {
  eventsForm: FormGroup;
  isEditMode = false;
  eventId: number | null = null;
  loading = false;
  submitted = false;
  organizations: Organization[] = [];
  isSuperAdmin = false;
  private translations: any = {}; 
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventsService: EventsService,
    private organizationService: LookupService,
    private messageService: MessageService,
    private translationService: TranslationService,
    private authService: AuthService
  ) {
    this.eventsForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      nameSE: ['', Validators.required],
      organizationId: [null, Validators.required],
      start: [null],
      end: [null],
      locationId: [null]
    });
  }

  ngOnInit(): void {
    this.isSuperAdmin = this.checkIsSuperAdmin();
    
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.eventsForm.patchValue({ organizationId: +orgId });
      }
    }

    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });

    this.loadOrganizations();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.eventId = +params['id'];
        this.loadEvent(this.eventId);
      }
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

  loadEvent(id: number): void {
    this.loading = true;
    this.eventsService.getEventsById(id).subscribe({
      next: (response: ApiResponse<Events>) => {
        if (response.succeeded && response.data) {
          this.eventsForm.patchValue({
            code: response.data.code,
            name: response.data.name,
            nameSE: response.data.nameSE,
            organizationId: response.data.organizationId,
            start: response.data.start ? this.formatDateForInput(response.data.start) : null,
            end: response.data.end ? this.formatDateForInput(response.data.end) : null,
            locationId: response.data.locationId
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
          detail: this.translations.eventsForm?.toasts?.loadError || 'Failed to load event data'
        });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.eventsForm.invalid) {
      this.markFormGroupTouched(this.eventsForm);
      return;
    }

    this.loading = true;
    const formData = this.eventsForm.value;

    if (this.isEditMode && this.eventId) {
      const editData: EditEvents = {
        id: this.eventId,
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
          summary: this.translations.common?.success || 'Success',
          detail: this.translations.eventsForm?.toasts?.createSuccess || 'Event created successfully'
        });
        this.router.navigate(['/events']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
          detail: this.translations.eventsForm?.toasts?.createError || 'Failed to create event'
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
          summary: this.translations.common?.success || 'Success',
          detail: this.translations.eventsForm?.toasts?.updateSuccess || 'Event updated successfully'
        });
        this.router.navigate(['/events']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translations.common?.error || 'Error',
          detail: this.translations.eventsForm?.toasts?.updateError || 'Failed to update event'
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
    this.router.navigate(['/events']);
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
}
