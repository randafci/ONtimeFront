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

import { Router, RouterLink } from '@angular/router';
import { RoleDto, RoleService } from '../role.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PagedListRequest } from '../../../core/models/api-response.model';
import { ToastModule } from 'primeng/toast';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { UsersWithoutRolesModalComponent } from '../users-without-roles-modal/users-without-roles-modal.component';

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
    ConfirmDialogModule,
    UsersWithoutRolesModalComponent
  ],
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class RolesListComponent implements OnInit {
  rolesList: RoleDto[] = [];
  cols: any[] = [];
  loading = true;
  totalRecords = 0;
  rows = 10;
  first = 0;
  searchValue = '';
  private translations: any = {};

  // Modal properties
  usersModalVisible: boolean = false;
  selectedRoleForModal: RoleDto | null = null;

  constructor(
    private roleService: RoleService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });

    this.cols = [
      { field: 'name', headerKey: 'rolesList.headers.name' },
      { field: 'isDefaultRole', headerKey: 'rolesList.headers.isDefault' },
      { field: 'isHRRole', headerKey: 'rolesList.headers.isHR' },
      { field: 'actions', headerKey: 'rolesList.headers.actions' }
    ];
  }

  loadRoles(event: TableLazyLoadEvent): void {
    this.loading = true;
    const page = (event.first || 0) / (event.rows || 10) + 1;
    const request: PagedListRequest = {
      page: page,
      pageSize: event.rows || 10,
      filter: {
        sortField: event.sortField as string || 'Id',
        sortDirection: event.sortOrder === 1 ? 1 : -1,
        logic: 'or',
        filters: this.searchValue ? [{ field: 'Name', operator: 'contains', value: this.searchValue }] : []
      }
    };

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
        this.showToast('error', this.translations.common?.error, this.translations.rolesList?.messages?.loadError);
      }
    });
  }
  
  onSearch(table: Table): void {
    table.reset();
  }

  clear(table: Table) {
    this.searchValue = '';
    table.reset();
  }

  editRole(role: RoleDto) {
    this.router.navigate(['/roles/edit', role.id]);
  }

  editPermissions(role: RoleDto) {
    this.router.navigate(['/permitions/edit', role.id]);
  }

  deleteRole(role: RoleDto) {
    const messages = this.translations.rolesList?.messages || {};
    const common = this.translations.common || {};
    const message = (messages.deleteConfirm || "Are you sure you want to delete the role '{name}'?").replace('{name}', role.name);

    this.confirmationService.confirm({
      message: message,
      header: common.confirmDelete || 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.roleService.deleteRole(role.id).subscribe({
          next: () => {
            this.showToast('success', common.success, messages.deleteSuccess);
            this.loadRoles({ first: this.first, rows: this.rows }); 
          },
          error: (err) => {
            this.showToast('error', common.error, err.error?.message || messages.deleteError);
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
        this.showToast('success', this.translations.common?.success, this.translations.rolesList?.messages?.updateSuccess);
        this.loadRoles({ first: this.first, rows: this.rows }); 
      },
      error: (err) => {
        this.showToast('error', this.translations.common?.error, err.error?.message || this.translations.rolesList?.messages?.updateError);
      }
    });
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

  navigateToUsers(role: RoleDto) {
    this.selectedRoleForModal = role;
    this.usersModalVisible = true;
  }

  onUsersModalVisibleChange(visible: boolean) {
    this.usersModalVisible = visible;
    if (!visible) {
      this.selectedRoleForModal = null;
    }
  }

  onUsersAssigned() {
    // Refresh the roles list if needed
    this.loadRoles({ first: this.first, rows: this.rows });
  }
}