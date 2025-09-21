import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from "@angular/router";
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Family } from '@/interfaces/family.interface';
import { FamilyService } from '../FamilyService';
import { LookupService } from '../../organization/OrganizationService';
import { Organization } from '@/interfaces/organization.interface';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { AuthService } from '@/auth/auth.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { FamilyModalComponent } from '../family-modal/family-modal.component';

@Component({
  selector: 'app-family-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, DatePipe,
    TableModule, ButtonModule, InputTextModule, ToastModule, TagModule,
    IconFieldModule, InputIconModule,
    TranslatePipe, FamilyModalComponent
  ],
  providers: [MessageService, ConfirmationService, TranslatePipe],
  templateUrl: './family-list.component.html',
})
export class FamilyListComponent implements OnInit {
  families: Family[] = [];
  loading: boolean = true;

  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  selectedFamily: Family | null = null;
  
  organizations: Organization[] = [];
  isSuperAdmin: boolean = false;

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private familyService: FamilyService,
    private organizationService: LookupService,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private translatePipe: TranslatePipe,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isSuperAdmin = this.checkIsSuperAdmin();
    this.loadFamilies();
    this.loadOrganizations();
  }

  private checkIsSuperAdmin(): boolean {
    const claims = this.authService.getClaims();
    return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
  }

  loadOrganizations(): void {
    this.organizationService.getAllOrganizations().subscribe({
      next: (response: ApiResponse<Organization[]>) => {
        if (response.succeeded) {
          this.organizations = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
      }
    });
  }


  loadFamilies() {
    this.loading = true;
    this.familyService.getAllFamilies().subscribe({
      next: (response: ApiResponse<Family[]>) => {
        if (response.succeeded && response.data) {
          this.families = response.data;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message || 'Failed to load families' });
        }
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load families' });
        this.loading = false;
      }
    });
  }

  getStatus(family: Family): string {
    return family.isDeleted ? 'inactive' : 'active';
  }

  getSeverity(status: string): string {
    return status === 'active' ? 'success' : 'danger';
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.selectedFamily = null;
    this.dialogVisible = true;
  }

  openEditDialog(family: Family) {
    this.isEditMode = true;
    this.selectedFamily = family;
    this.dialogVisible = true;
  }

  onFamilySaved(family: Family): void {
    this.loadFamilies();
  }

  deleteFamily(family: Family) {
    const message = this.translatePipe.transform('common.deleteConfirm').replace('{name}', family.name);
    this.confirmationService.confirm({
      message: message,
      header: this.translatePipe.transform('common.deleteHeader'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.familyService.deleteFamily(family.id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Family deleted successfully.' });
                this.loadFamilies(); 
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to delete family.' });
            }
        });
      }
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }
}