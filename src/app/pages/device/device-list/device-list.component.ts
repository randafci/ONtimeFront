import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
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
import { TieredMenuModule } from 'primeng/tieredmenu';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    RippleModule,
    TooltipModule,
    TieredMenuModule,
    TranslatePipe,
    RouterLink,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService, MessageService, TranslatePipe]
})
export class DeviceListComponent implements OnInit {
  devices: Device[] = [];
  cols: any[] = [];
  loading = true;


  totalRecords = 0;
  rows = 10;
  

  searchValue = '';

  constructor(
    private deviceService: DeviceService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit(): void {
    this.cols = [
      { field: 'code', headerKey: 'devices.listPage.headers.code' },
      { field: 'name', headerKey: 'devices.listPage.headers.name' },
      { field: 'ipAddress', headerKey: 'devices.listPage.headers.ipAddress' },
      { field: 'locationName', headerKey: 'devices.listPage.headers.location' },
      { field: 'disabled', headerKey: 'devices.listPage.headers.disabled' },
      { field: 'download', headerKey: 'devices.listPage.headers.downloadLogs' },
      { field: 'actions', headerKey: 'devices.listPage.headers.actions' }
    ];
  }

  loadDevices(event: TableLazyLoadEvent): void {
    this.loading = true;
    
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
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load devices.' });
      }
    });
  }
  
  onSearch(table: any): void {
    table.reset();
  }

  clear(table: any): void {
    this.searchValue = '';
    table.reset();
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
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Device deleted successfully.' });
            this.onSearch(null);
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to delete device.' });
          }
        });
      }
    });
  }
}