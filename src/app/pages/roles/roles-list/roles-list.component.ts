import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';


// Import our custom TranslatePipe
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { Router, RouterLink } from '@angular/router';
import { RoleDto, RoleService } from '../role.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PagedListRequest } from '@/core/models/api-response.model';
import { ToastModule } from 'primeng/toast';

// Define an interface for our mock data
export interface IRole {
  id: number;
  name: string;
  isDefaultRole: boolean;
  isHRRole: boolean;
}

@Component({
  selector: 'app-roles-list',
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
    TranslatePipe, // Import the pipe
    RouterLink,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class RolesListComponent implements OnInit {
  rolesList: RoleDto[] = [];
  cols: any[] = [];
  loading = true;

  // State for server-side pagination
  totalRecords = 0;
  rows = 10;
  first = 0;
  
  // State for searching
  searchValue = '';

  constructor(
    private roleService: RoleService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cols = [
      { field: 'name', headerKey: 'rolesList.headers.name' },
      { field: 'isDefaultRole', headerKey: 'rolesList.headers.isDefault' },
      { field: 'isHRRole', headerKey: 'rolesList.headers.isHR' },
      { field: 'actions', headerKey: 'rolesList.headers.actions' }
    ];
    // Initial load is handled by the table's (onLazyLoad) event
  }

  loadRoles(event: TableLazyLoadEvent): void {
    this.loading = true;
    
    const page = (event.first || 0) / (event.rows || 10) + 1;
    const sortField = event.sortField as string || 'Id';
    const sortDirection = event.sortOrder === 1 ? 1 : -1;

    const request: PagedListRequest = {
      page: page,
      pageSize: event.rows || 10,
      filter: {
        sortField: sortField,
        sortDirection: sortDirection,
      }
    };
    
    // Add search filter if there's a search value
    if (this.searchValue) {
        request.filter.logic = 'or';
        request.filter.filters = [{ field: 'Name', operator: 'contains', value: this.searchValue }];
    }

    this.roleService.getRolesWithPagination(request).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.rolesList = response.data.items;
          this.totalRecords = response.data.totalCount;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load roles.' });
      }
    });
  }
  
  onSearch(table: Table): void {
    // Reset paginator to the first page and trigger a lazy load
    table.reset();
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = '';
    table.reset();
  }

  editRole(role: RoleDto) {
    this.router.navigate(['/roles/edit', role.id]);
  }

  deleteRole(role: RoleDto) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the role '${role.name}'?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.roleService.deleteRole(role.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role deleted successfully.' });
            // Refresh the table
            this.loadRoles({ first: this.first, rows: this.rows }); 
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to delete role.' });
          }
        });
      }
    });
  }

  makeAsDefault(role: RoleDto) {
    const wasAlreadyDefault = role.isDefaultRole;
    const updatedRole = { ...role, isDefaultRole: !wasAlreadyDefault };

    this.roleService.updateRole(role.id, updatedRole).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role updated.' });
        // Refresh the table to show updated status for all roles
        this.loadRoles({ first: this.first, rows: this.rows }); 
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to update role.' });
      }
    });
  }
}