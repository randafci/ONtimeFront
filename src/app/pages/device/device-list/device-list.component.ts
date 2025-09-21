import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { PagedListRequest } from '../../../core/models/api-response.model'; 
import { Device } from '../device.model';
import { DeviceService } from '../device.service';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule,
    RippleModule, TooltipModule, TranslatePipe, RouterLink, ToastModule,
    ConfirmDialogModule, IconFieldModule, InputIconModule
  ],
  providers: [ConfirmationService, MessageService, TranslatePipe]
})
export class DeviceListComponent implements OnInit {
  @ViewChild('table') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  devices: Device[] = [];
  loading = true;
  totalRecords = 0;
  rows = 10;
  searchValue = '';
  lastLazyLoadEvent: TableLazyLoadEvent | null = null; // Store the last event for reloads

  constructor(
    private deviceService: DeviceService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit(): void {
    // The cols array is no longer needed as columns are now defined in the HTML.
  }

  loadDevices(event: TableLazyLoadEvent): void {
    this.loading = true;
    this.lastLazyLoadEvent = event; // Save the current state
    
    const page = (event.first || 0) / (event.rows || 10) + 1;
    const sortField = event.sortField as string || 'Name'; 
    const sortDirection = event.sortOrder === 1 ? 1 : -1;

    const request: PagedListRequest = {
      page: page,
      pageSize: event.rows || 10,
      filter: {
        sortField: sortField,
        sortDirection: sortDirection,
      }
    };
    
    if (this.searchValue) {
        request.filter.logic = 'or';
        request.filter.filters = [
          { field: 'Name', operator: 'contains', value: this.searchValue },
          { field: 'Code', operator: 'contains', value: this.searchValue }
        ];
    }

    this.deviceService.getDevices(request).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.devices = response.data.items;
          this.totalRecords = response.data.totalCount;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: this.translatePipe.transform('devices.listPage.messages.loadError') });
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: this.translatePipe.transform('devices.listPage.messages.loadError') });
      }
    });
  }
  
  // CORRECTED: This now triggers a data reload.
  onSearch(): void {
    if (this.lastLazyLoadEvent) {
        this.loadDevices(this.lastLazyLoadEvent);
    }
  }

  // CORRECTED: This now clears the search and reloads the data.
  clear(): void {
    this.searchValue = '';
    this.filter.nativeElement.value = '';
    if (this.lastLazyLoadEvent) {
      this.loadDevices(this.lastLazyLoadEvent);
    }
  }

  editDevice(device: Device): void {
    this.router.navigate(['/devices/edit', device.id]);
  }

  deleteDevice(device: Device): void {
    this.confirmationService.confirm({
      message: this.translatePipe.transform('devices.listPage.messages.deleteConfirm').replace('{name}', device.name),
      header: this.translatePipe.transform('common.confirmDelete'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deviceService.deleteDevice(device.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: this.translatePipe.transform('devices.listPage.messages.deleteSuccess') });
            // Reload the table with current settings after a successful delete
            if (this.lastLazyLoadEvent) {
              this.loadDevices(this.lastLazyLoadEvent);
            }
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || this.translatePipe.transform('devices.listPage.messages.deleteError') });
          }
        });
      }
    });
  }
}