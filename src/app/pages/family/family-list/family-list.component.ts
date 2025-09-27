import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from "@angular/router";
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
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
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';

@Component({
  selector: 'app-family-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, DatePipe,
    TableModule, ButtonModule, InputTextModule, ToastModule, ConfirmDialogModule, TagModule,
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
  private translations: any = {};

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private familyService: FamilyService,
    private organizationService: LookupService,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private translatePipe: TranslatePipe,
    private authService: AuthService,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    this.isSuperAdmin = this.checkIsSuperAdmin();
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });
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
          this.showToast('error', this.translations.common?.error, response.message || this.translations.familyList?.toasts?.loadError);
        }
        this.loading = false;
      },
      error: (err) => {
        this.showToast('error', this.translations.common?.error, this.translations.familyList?.toasts?.loadError);
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
    const commonTrans = this.translations.common || {};
    const familyTrans = this.translations.familyList?.toasts || {};

    const message = (commonTrans.deleteConfirm || 'Are you sure you want to delete {name}?').replace('{name}', family.name);
    
    this.confirmationService.confirm({
      message: message,
      header: commonTrans.deleteHeader || 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.familyService.deleteFamily(family.id).subscribe({
            next: () => {
                this.showToast('success', commonTrans.success, familyTrans.deleteSuccess);
                this.loadFamilies(); 
            },
            error: (err) => {
                this.showToast('error', commonTrans.error, err.error?.message || familyTrans.deleteError);
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

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}