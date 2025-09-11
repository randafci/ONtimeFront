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

import { ConfirmationService, MessageService } from 'primeng/api';
import { Events } from '@/interfaces/events.interface';
import { EventsService } from '../EventsService';
import { Router, RouterModule } from "@angular/router";
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { TranslationService } from '@/pages/translation-manager/translation-manager/translation.service';
import { ApiResponse } from '@/core/models/api-response.model';


@Component({
  selector: 'app-events-list',
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
    TranslatePipe
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

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  
  private translations: any = {};

  constructor(
    private eventsService: EventsService,
    private messageService: MessageService,
    private router: Router,
    private translationService: TranslationService, 
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
      this.statuses = [
        { label: translations.eventsList?.statusValues?.active || 'Active', value: 'active' },
        { label: translations.eventsList?.statusValues?.inactive || 'Inactive', value: 'inactive' }
      ];
    });

    this.loadEvents();
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

  navigateToAdd() {
    this.router.navigate(['/events/add']);
  }

  navigateToEdit(id: number) {
    this.router.navigate(['/events/edit', id]);
  }

  deleteEvents(event: Events) {
    const message = (this.translations.eventsList?.messages?.deleteConfirm || '')
                    .replace('${name}', event.name);

    this.confirmationService.confirm({
      message: message,
      header: this.translations.eventsList?.messages?.deleteHeader || 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        console.log('Deleting event:', event);
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
