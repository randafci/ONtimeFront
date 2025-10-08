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
import { Router, RouterLink } from '@angular/router';
import { RoleDto, RoleService } from '../role.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PagedListRequest } from '../../../core/models/api-response.model';
import { ToastModule } from 'primeng/toast';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { UsersWithoutRolesModalComponent } from '../users-without-roles-modal/users-without-roles-modal.component';
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { SelectModule } from 'primeng/select';
import { Tag } from "primeng/tag";

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
    TranslatePipe,
    RouterLink,
    ToastModule,
    ConfirmDialogModule,
    UsersWithoutRolesModalComponent,
    IconField,
    InputIcon,
    SelectModule,
    Tag
  ],
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class RolesListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

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

  booleanOptions = [
    { label: 'common.yes', value: true },
    { label: 'common.no', value: false }
  ];

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

    // Load initial data
    this.loadInitialData();
  }

  loadInitialData(): void {
    const initialEvent: TableLazyLoadEvent = {
      first: this.first,
      rows: this.rows
    };
    this.loadRoles(initialEvent);
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
        } else {
          this.showToast('error', this.translations.common?.error, response.message || this.translations.rolesList?.messages?.loadError);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.loading = false;
        this.showToast('error', this.translations.common?.error, error.error?.message || this.translations.rolesList?.messages?.loadError);
      }
    });
  }

  onSearch(table: Table): void {
    // Reset to first page when searching
    this.first = 0;
    table.reset();
  }

  onGlobalFilter(table: Table, event: any): void {
    const value = event.target.value;
    this.searchValue = value;
    // Reset to first page when filtering
    this.first = 0;
    table.filterGlobal(value, 'contains');
  }

  clear(table: Table): void {
    this.searchValue = '';
    this.first = 0;
    table.clear();
    // Manually trigger load since clear() might not trigger lazy load
    this.loadRoles({ first: this.first, rows: this.rows });
  }

  editRole(role: RoleDto): void {
    this.router.navigate(['/roles/edit', role.id]);
  }

  editPermissions(role: RoleDto): void {
    this.router.navigate(['/permitions/edit', role.id]);
  }

  deleteRole(role: RoleDto): void {
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
            this.loadInitialData(); // Reload data after deletion
          },
          error: (err) => {
            this.showToast('error', common.error, err.error?.message || messages.deleteError);
          }
        });
      }
    });
  }

  makeAsDefault(role: RoleDto): void {
    const wasAlreadyDefault = role.isDefaultRole;
    const updatedRole = { ...role, isDefaultRole: !wasAlreadyDefault };

    this.roleService.updateRole(role.id, updatedRole).subscribe({
      next: () => {
        this.showToast('success', this.translations.common?.success, this.translations.rolesList?.messages?.updateSuccess);
        this.loadInitialData(); // Reload data after update
      },
      error: (err) => {
        this.showToast('error', this.translations.common?.error, err.error?.message || this.translations.rolesList?.messages?.updateError);
      }
    });
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

  navigateToUsers(role: RoleDto): void {
    this.selectedRoleForModal = role;
    this.usersModalVisible = true;
  }

  onUsersModalVisibleChange(visible: boolean): void {
    this.usersModalVisible = visible;
    if (!visible) {
      this.selectedRoleForModal = null;
    }
  }

  onUsersAssigned(): void {
    // Refresh the roles list
    this.loadInitialData();
  }
}