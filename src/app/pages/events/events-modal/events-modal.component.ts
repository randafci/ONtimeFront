import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Events, CreateEvents, EditEvents } from '../../../interfaces/events.interface';
import { EventsService } from '../EventsService';
import { Location } from '../../../interfaces/location.interface';
import { LocationService } from '../../location/location.service';
import { Organization } from '../../../interfaces/organization.interface';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-events-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ButtonModule
  ],
  providers: [MessageService],
  templateUrl: './events-modal.component.html'
})
export class EventsModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() event: Events | null = null;
  @Input() organizations: Organization[] = [];
  @Input() locations: Location[] = [];
  @Input() isSuperAdmin: boolean = false;
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<Events>();
  @Output() onCancelEvent = new EventEmitter<void>();

  eventsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private eventsService: EventsService,
    private locationService: LocationService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    this.eventsForm = this.createForm();
  }

  ngOnInit(): void {
    // Initialize form
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dialogVisible'] && this.dialogVisible && this.isEditMode && this.event) {
      this.patchForm(this.event);
    } else if (changes['dialogVisible'] && this.dialogVisible && !this.isEditMode) {
      this.resetFormForCreate();
    }
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

  patchForm(event: Events): void {
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
  }

  resetFormForCreate(): void {
    this.eventsForm.reset();
    if (!this.isSuperAdmin) {
      const orgId = this.authService.getOrgId();
      if (orgId) {
        this.eventsForm.patchValue({ organizationId: +orgId });
        this.eventsForm.get('organizationId')?.disable();
      }
    } else {
      this.eventsForm.get('organizationId')?.enable();
    }
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

  onSubmit(): void {
    if (this.eventsForm.invalid) {
      this.markFormGroupTouched(this.eventsForm);
      return;
    }

    this.loading = true;
    const formData = this.eventsForm.getRawValue(); // Use getRawValue to include disabled fields

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
        this.onSave.emit(response.data);
        this.closeDialog();
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
        this.onSave.emit(response.data);
        this.closeDialog();
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

  closeDialog(): void {
    this.dialogVisibleChange.emit(false);
    this.eventsForm.get('organizationId')?.enable(); // Re-enable on close
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

