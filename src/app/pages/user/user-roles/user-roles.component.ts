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

import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../pages/translation-manager/translation-manager/translation.service';
import { UserService } from '../userService';
import { UserRole, UpdateUserRoles } from '../../../interfaces/user-role.interface';
import { ApiResponse } from '../../../core/models/api-response.model';
import { UserDto } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-user-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    ToastModule,
    TranslatePipe
  ],
  providers: [MessageService],
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.scss']
})
export class UserRolesComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild('filter') filter!: ElementRef;

  userId: string = '';
  user: UserDto | null = null;
  roles: UserRole[] = [];
  selectedRoles: UserRole[] = [];
  
  loading: boolean = true;
  updating: boolean = false;
  private translations: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private messageService: MessageService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    if (!this.userId) {
      this.goBack();
      return;
    }
    
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });

    this.loadUserRoles();
    this.loadUserDetails();
  }

  loadUserDetails(): void {
    this.userService.getById(this.userId).subscribe({
      next: (response) => {
        if(response.succeeded) this.user = response.data;
      }
    })
  }

  loadUserRoles(): void {
    this.loading = true;
    this.userService.getUserRoles(this.userId).subscribe({
      next: (response: ApiResponse<UserRole[]>) => {
        if (response.succeeded) {
          this.roles = response.data || [];
          // Pre-select the roles that are already assigned
          this.selectedRoles = this.roles.filter(role => role.isSelected);
        } else {
          this.showToast('error', this.translations.common?.error, response.message || 'An error occurred while loading roles.');
        }
        this.loading = false;
      },
      error: () => {
        this.showToast('error', this.translations.common?.error, 'Failed to load user roles.');
        this.loading = false;
      }
    });
  }
  
  onUpdate(): void {
    this.updating = true;
    
    const updatePayload: UpdateUserRoles = {
      roleNames: this.selectedRoles.map(role => role.roleName)
    };

    this.userService.updateUserRoles(this.userId, updatePayload).subscribe({
      next: (response: ApiResponse<boolean>) => {
        if (response.succeeded) {
          this.showToast('success', this.translations.common?.success, 'User roles updated successfully.');
          this.goBack();
        } else {
          this.showToast(
            'error', 
            this.translations.common?.error || 'Error', 
            response.message || 'An error occurred while updating roles.' // Provide a fallback
          );
        }
        this.updating = false;
      },
      error: () => {
        this.showToast('error', this.translations.common?.error, 'Failed to update user roles.');
        this.updating = false;
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
    this.router.navigate(['/users/list']);
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail: detail || 'An unknown error occurred.' });
  }
}