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
    TableModule
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
  integrationOptions: any[] = [];
  private translations: any = {};

  constructor(
    private userService: UserService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
      this.initializeTranslatedArrays();
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
          this.showToast('error', this.translations.common?.error, response.message || this.translations.users?.listPage?.messages?.loadError);
        }
        this.loading = false;
      },
      error: (error) => {
        this.showToast('error', this.translations.common?.error, this.translations.users?.listPage?.messages?.loadError);
        this.loading = false;
      }
    });
  }

  initializeTranslatedArrays(): void {
    const commonTrans = this.translations.common;
    this.integrationOptions = [
      { label: commonTrans?.yes || 'Yes', value: true },
      { label: commonTrans?.no || 'No', value: false }
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

  getSeverity(isLdap: boolean): string {
    return isLdap ? 'success' : 'info';
  }

  navigateToAdd(): void {
    this.router.navigate(['/users/add']);
  }

  navigateToEdit(userId: string): void {
    this.router.navigate(['/users/edit', userId]);
  }

  deleteUser(user: UserDto): void {
    const messages = this.translations.users?.listPage?.messages || {};
    const common = this.translations.common || {};
    const message = (messages.deleteConfirm || 'Are you sure you want to delete user {name}?').replace('{name}', user.userName);

    this.confirmationService.confirm({
      message: message,
      header: common.confirmDelete || 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.delete(user.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.showToast('success', common.success, messages.deleteSuccess);
              this.loadUsers();
            } else {
              this.showToast('error', common.error, response.message || messages.deleteError);
            }
          },
          error: (error) => {
            this.showToast('error', common.error, messages.deleteError);
          }
        });
      }
    });
  }
  
  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}