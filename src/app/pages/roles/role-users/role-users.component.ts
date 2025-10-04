import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { RoleService, RoleDto } from '../role.service';
import { UserInRole, RemoveUsersFromRole } from '../../../interfaces/role-user.interface';
import { APIOperationResponse } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-role-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    ToastModule,
    ConfirmDialogModule,
    TranslatePipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './role-users.component.html',
  styleUrls: ['./role-users.component.scss']
})
export class RoleUsersComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild('filter') filter!: ElementRef;

  roleId: string = '';
  role: RoleDto | null = null;
  users: UserInRole[] = [];
  selectedUsers: UserInRole[] = [];
  
  loading: boolean = true;
  deleting: boolean = false;
  private translations: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id')!;
    if (!this.roleId) {
      this.goBack();
      return;
    }
    
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });

    this.loadRoleDetails();
    this.loadUsersInRole();
  }
  
  loadRoleDetails(): void {
    this.roleService.getRoleById(this.roleId).subscribe({
      next: (response) => {
        if(response.succeeded) this.role = response.data;
      }
    });
  }

  loadUsersInRole(): void {
    this.loading = true;
    this.roleService.getUsersInRole(this.roleId).subscribe({
      next: (response: APIOperationResponse<UserInRole[]>) => {
        if (response.succeeded) {
          this.users = response.data || [];
        } else {
          this.showToast(
            'error', 
            this.translations.common?.error || 'Error', // Fallback for translation
            response.message || 'An error occurred while loading the user list.' // Fallback for the message
          );
        }
        this.loading = false;
      },
      error: () => {
        this.showToast('error', this.translations.common?.error, 'Failed to load users in role.');
        this.loading = false;
      }
    });
  }
  
  onDeleteSelected(): void {
    if (!this.selectedUsers || this.selectedUsers.length === 0) {
      return;
    }

    const messages = this.translations.roles_usersPage?.messages || {};
    const common = this.translations.common || {};

    this.confirmationService.confirm({
      message: messages.deleteConfirm || `Are you sure you want to remove ${this.selectedUsers.length} selected user(s) from this role?`,
      header: common.confirmDelete || 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleting = true;
        const deletePayload: RemoveUsersFromRole = {
          userIds: this.selectedUsers.map(user => user.id)
        };

        this.roleService.removeUsersFromRole(this.roleId, deletePayload).subscribe({
          next: (response: APIOperationResponse<boolean>) => {
            if (response.succeeded) {
              this.showToast('success', common.success, messages.deleteSuccess || 'Users removed successfully.');
              this.selectedUsers = [];
              this.loadUsersInRole(); // Reload the list
            } else {
              this.showToast(
                'error', 
                common.error || 'Error', 
                response.message || messages.deleteError || 'Failed to remove users.' // Provide fallbacks
              );
            }
            this.deleting = false;
          },
          error: () => {
            this.showToast('error', common.error, messages.deleteError || 'Failed to remove users.');
            this.deleting = false;
          }
        });
      }
    });
  }

  onGlobalFilter(table: Table, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }

  clear(table: Table): void {
    table.clear();
    if (this.filter?.nativeElement) {
      this.filter.nativeElement.value = '';
    }
  }

  goBack(): void {
    this.router.navigate(['/roles/list']);
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail: detail || 'An unknown error occurred.' });
  }
}