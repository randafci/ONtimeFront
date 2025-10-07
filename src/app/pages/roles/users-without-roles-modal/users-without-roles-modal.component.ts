import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserDto } from '../../../interfaces/user.interface';
import { UserService } from '../../user/userService';
import { RoleDto } from '../role.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { UpdateUserRoles } from '../../../interfaces/user-role.interface';

@Component({
  selector: 'app-users-without-roles-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    CheckboxModule,
    TagModule,
    ToastModule,
    TranslatePipe
  ],
  providers: [MessageService],
  templateUrl: './users-without-roles-modal.component.html',
  styleUrls: ['./users-without-roles-modal.component.scss']
})
export class UsersWithoutRolesModalComponent implements OnInit, OnChanges {
  @Input() dialogVisible: boolean = false;
  @Input() selectedRole: RoleDto | null = null;
  @Input() loading: boolean = false;

  @Output() dialogVisibleChange = new EventEmitter<boolean>();
  @Output() onUsersAssigned = new EventEmitter<void>();

  users: UserDto[] = [];
  selectedUsers: UserDto[] = [];
  loadingUsers: boolean = false;
  assigningRoles: boolean = false;
  private translations: any = {};

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dialogVisible'] && this.dialogVisible && this.selectedRole) {
      this.loadUsersWithoutRoles();
    }
  }

  loadUsersWithoutRoles(): void {
    this.loadingUsers = true;
    // For now, we'll get all users and filter those without roles
    // You might want to create a specific API endpoint for this
    this.userService.getAll().subscribe({
      next: (response: ApiResponse<UserDto[]>) => {
        if (response.succeeded) {
          // Filter users without roles - this is a simplified approach
          // You might want to create a specific API endpoint for users without roles
          this.users = response.data || [];
        } else {
          this.showToast('error', this.translations.common?.error, response.message || 'Failed to load users');
        }
        this.loadingUsers = false;
      },
      error: () => {
        this.showToast('error', this.translations.common?.error, 'Failed to load users');
        this.loadingUsers = false;
      }
    });
  }

  onGlobalFilter(table: any, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }

  clear(table: any): void {
    table.clear();
  }

  getSeverity(isLdap: boolean): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" {
    return isLdap ? 'success' : 'info';
  }

  assignRoleToSelectedUsers(): void {
    if (!this.selectedUsers || this.selectedUsers.length === 0) {
      this.showToast('warn', this.translations.common?.warning, 'Please select at least one user');
      return;
    }

    if (!this.selectedRole) {
      this.showToast('error', this.translations.common?.error, 'No role selected');
      return;
    }

    this.assigningRoles = true;
    
    // Assign the selected role to each user
    const assignments = this.selectedUsers.map(user => {
      const updatePayload: UpdateUserRoles = {
        roleNames: [this.selectedRole!.name]
      };
      
      return this.userService.updateUserRoles(user.id, updatePayload);
    });

    // Execute all assignments
    let completed = 0;
    const total = assignments.length;
    let successCount = 0;

    assignments.forEach(assignment => {
      assignment.subscribe({
        next: () => {
          completed++;
          successCount++;
          if (completed === total) {
            this.handleAllAssignmentsComplete(successCount, total);
          }
        },
        error: () => {
          completed++;
          if (completed === total) {
            this.handleAllAssignmentsComplete(successCount, total);
          }
        }
      });
    });
  }

  private handleAllAssignmentsComplete(successCount: number, total: number): void {
    this.assigningRoles = false;
    
    if (successCount === total) {
      this.showToast('success', this.translations.common?.success, `Successfully assigned role to ${successCount} user(s)`);
    } else if (successCount > 0) {
      this.showToast('warn', this.translations.common?.warning, `Assigned role to ${successCount} out of ${total} users`);
    } else {
      this.showToast('error', this.translations.common?.error, 'Failed to assign role to any users');
    }
    
    this.onUsersAssigned.emit();
    this.closeDialog();
  }

  closeDialog(): void {
    this.dialogVisibleChange.emit(false);
    this.selectedUsers = [];
    this.users = [];
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}
