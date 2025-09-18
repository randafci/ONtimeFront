import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TreeSelectModule } from 'primeng/treeselect';
import { ProgressBar } from "primeng/progressbar";
import { Stepper } from "primeng/stepper";
import { ApiResponse, PagedListRequest } from '@/core/models/api-response.model';
import { EmployeeDeviceAssignmentCreateDto } from '@/interfaces/EemployeeDeviceAssignment.interface';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EmployeeDevicesAssignmentService } from '../EmployeeDevicesAssignment.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { StepperModule } from 'primeng/stepper';
import { DividerModule } from "primeng/divider";
import { Device } from '@/pages/device/device.model';
import { DeviceService } from '@/pages/device/device.service';
import { EmployeeService } from '@/pages/employee/EmployeeService';
import { Employee } from '@/interfaces/employee.interface';
import { LocationService } from '@/pages/location/location.service';
import { Location as AppLocation } from '@/interfaces/location.interface';

import { TranslationService } from '@/pages/translation-manager/translation-manager/translation.service';

@Component({
  selector: 'app-add-or-edit-employee-devices-assignment',
    standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    TableModule,
    MultiSelectModule,
    TreeSelectModule,
    //DropdownModule,
    RouterModule, // ADD THIS LINE - This is crucial for routing
    ProgressBar, // Also add these if you're using them
    ToastModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    InputTextModule,
    TagModule,
    ButtonModule,
    InputIconModule,
    IconFieldModule,
    SelectModule,
    ToastModule,
    RouterModule,
    ConfirmDialogModule,
    TooltipModule,
    DialogModule,
    StepperModule,
    DividerModule
],
providers: [ConfirmationService, MessageService, TranslatePipe],
  templateUrl: './add-or-edit-employee-devices-assignment.html',
  styleUrl: './add-or-edit-employee-devices-assignment.scss'
})
export class AddOrEditEmployeeDevicesAssignment implements OnInit {
  step = 1;
  cols: any[] = [];
  loading = false;
  totalRecords = 0;
  rows = 10;

  employees: Employee[] = [];
  locations: AppLocation[] = [];
  devices: Device[] = [];

  selectedLocation: string = '';
 

  searchValue = '';
  employeeSearchValue = '';
  locationSearchValue = '';


  selectedEmployees: any[] = [];
  selectedDevices: any[] = [];
  selectedLocations: any[] = [];

    private translations: any = {};

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private deviceService: DeviceService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private translatePipe: TranslatePipe,
    private employeeDevicesAssignmentService: EmployeeDevicesAssignmentService,
    private employeeService:EmployeeService,
    private locationService: LocationService,
    private translationService: TranslationService,
    
    
  ) {}

  ngOnInit() {
    this.cols = [
      { field: 'code', header: 'Code' },
      { field: 'name', header: 'Name' },
      { field: 'location', header: 'Location' }
    ];
     this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
      
    });

    this.loadEmployees();
    this.loadLocations();

  }

  nextStep() {
    if (this.step < 2) this.step++;
  }

  prevStep() {
    if (this.step > 1) this.step--;
  }
//#region  devices
  filterDevicesByLocation() {
    if (this.selectedLocation) {
      this.loading = true;
      const request: PagedListRequest = {
        page: 1,
        pageSize: this.rows,
        filter: {
          sortField: 'Name',
          sortDirection: 1,
          filters: [
            { field: 'Location', operator: 'contains', value: this.selectedLocation }
          ]
        }
      };
      
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
    } else {
      this.devices = [];
      this.totalRecords = 0;
    }
  }

  loadDevicesLazy(event: TableLazyLoadEvent): void {
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
    
    // Add location filter if selected
    if (this.selectedLocation) {
      if (!request.filter.filters) request.filter.filters = [];
      request.filter.filters.push({ field: 'Location', operator: 'contains', value: this.selectedLocation });
    }
    
    if (this.searchValue) {
      request.filter.logic = 'or';
      if (!request.filter.filters) request.filter.filters = [];
      request.filter.filters.push(
        { field: 'Name', operator: 'contains', value: this.searchValue },
        { field: 'Code', operator: 'contains', value: this.searchValue }
      );
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
//#endregion

//#region employee
 loadEmployees() {
    console.log('Loading employees...');
    this.loading = true;
    this.employeeService.getAllEmployees().subscribe({
      next: (response: ApiResponse<Employee[]>) => {
        if (response.succeeded) {
          console.log('Employees loaded successfully:', response.data.length, 'employees');
          this.employees = response.data;
        } else {
          console.error('Failed to load employees:', response.message);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load employees'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load employees'
        });
        this.loading = false;
      }
    });
  }
  
  getFullName(employee: Employee): string {
    if (employee.firstName && employee.lastName) {
      return `${employee.firstName} ${employee.lastName}`;
    } else if (employee.firstName) {
      return employee.firstName;
    } else if (employee.lastName) {
      return employee.lastName;
    } else {
      return 'N/A';
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clearEmployee(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }
//#endregion
  
//#region location
 loadLocations() {
    this.loading = true;
    this.locationService.getAllLocations().subscribe({
      next: (response: ApiResponse<AppLocation[]>) => {
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

//#endregion
submit() {
  if (!this.selectedEmployees.length || !this.selectedDevices.length || !this.selectedLocations.length) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Please select employees, devices and location before submitting.'
    });
    return;
  }

  this.selectedEmployees.forEach(emp => {
    const dto: EmployeeDeviceAssignmentCreateDto = {
      employeeId: emp.id,
      devices: this.selectedDevices.map(dev => {
        const loc = this.selectedLocations[0]; // assuming single location selection
        return {
          id: dev.id,
          name: dev.name,
          code: dev.code,
          location: loc.name,       // ✅ use location name
          locationId: loc.id,       // ✅ use location id
          disabled: dev.disabled ?? false,
          download: dev.download ?? false,
          ipAddress: dev.ipAddress
        };
      })
    };

    console.log('Prepared DTO for submission:', dto);

    this.employeeDevicesAssignmentService.assignDevice(dto).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Devices assigned to ${emp.firstName} ${emp.lastName}`
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to assign devices.'
          });
        }
      },
      error: (err) => {
        console.error('Error assigning device:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Something went wrong while assigning devices.'
        });
      }
    });
  });
}



}