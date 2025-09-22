import { User } from '../../../auth/user.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ColumnFilter, Table, TableModule } from 'primeng/table';
import { UserService } from '../userService';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { UserDto } from '../../../interfaces/user.interface';
import { TranslationService } from '../../../pages/translation-manager/translation-manager/translation.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiResponse } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-user-list',
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    TranslatePipe,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    TableModule,
    TranslatePipe
],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
  providers: [ConfirmationService, MessageService]
})
export class UserList implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild('filter') filter!: ElementRef;

  users: UserDto[] = [];
  loading: boolean = true;
  statuses: any[] = [];

  // Store the current translations
  private translations: any = {};
integrationOptions: any[]|undefined;

  constructor(
    private userService: UserService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Subscribe to translation changes
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
      this.initializeStatuses();
    });

    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
this.userService.getAll().subscribe({
  next: (response: ApiResponse<UserDto[]>) => {
    if (response.succeeded) {
      this.users = response.data || [];
    } else {
      const errorMessage = response.message || 
                          (response.errors ? JSON.stringify(response.errors) : null) ||
                          this.translations.userList?.messages?.loadError ||
                          'Failed to load users';
      
      this.messageService.add({
        severity: 'error',
        summary: this.translations.common?.error || 'Error',
        detail: errorMessage
      });
    }
    this.loading = false;
  },
  error: (error) => {
    console.error('Error loading users:', error);
    this.messageService.add({
      severity: 'error',
      summary: this.translations.common?.error || 'Error',
      detail: this.translations.userList?.messages?.loadError || 'Failed to load users'
    });
    this.loading = false;
  }
});
  }

  initializeStatuses(): void {
    this.statuses = [
      { 
        label: this.translations.userList?.statusValues?.active || 'Active', 
        value: true 
      },
      { 
        label: this.translations.userList?.statusValues?.inactive || 'Inactive', 
        value: false 
      }
    ];
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

  getSeverity(status: boolean): string {
    return status ? 'success' : 'danger';
  }

  navigateToAdd(): void {
    this.router.navigate(['/users/add']);
  }

  navigateToEdit(userId: string): void {
    this.router.navigate(['/users/edit', userId]);
  }

  deleteUser(user: UserDto): void {
    const message = (this.translations.userList?.messages?.deleteConfirm || 'Are you sure you want to delete user {name}?')
                    .replace('{name}', user.userName);

    this.confirmationService.confirm({
      message: message,
      header: this.translations.common?.confirmDelete || 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.delete(user.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.messageService.add({
                severity: 'success',
                summary: this.translations.common?.success || 'Success',
                detail: this.translations.userList?.messages?.deleteSuccess || 'User deleted successfully'
              });
              this.loadUsers();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: this.translations.common?.error || 'Error',
                detail: response.message || this.translations.userList?.messages?.deleteError
              });
            }
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.messageService.add({
              severity: 'error',
              summary: this.translations.common?.error || 'Error',
              detail: this.translations.userList?.messages?.deleteError || 'Failed to delete user'
            });
          }
        });
      }
    });
  }
}