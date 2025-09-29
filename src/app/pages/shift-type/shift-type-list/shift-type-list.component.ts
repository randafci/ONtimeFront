import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ShiftType } from '../../../interfaces/shift-type.interface';
import { ShiftTypeService } from '../shift-type.service';
import { Router, RouterModule } from "@angular/router";
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { ShiftTypeModalComponent } from '../shift-type-modal/shift-type-modal.component';
import { Organization } from '../../../interfaces/organization.interface';
import { LookupService } from '../../organization/OrganizationService';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';

@Component({
  selector: 'app-shift-type-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    MultiSelectModule,
    InputTextModule,
    SliderModule,
    ProgressBarModule,
    TagModule,
    ButtonModule,
    InputIconModule,
    IconFieldModule,
    SelectModule,
    ToastModule,
    TooltipModule,
    RouterModule,
    ConfirmDialogModule,
    ShiftTypeModalComponent,
    TranslatePipe
  ],
  providers: [MessageService, ConfirmationService, TranslatePipe],
  templateUrl: './shift-type-list.component.html'
})
export class ShiftTypeListComponent implements OnInit {
  shiftTypes: ShiftType[] = [];
  loading: boolean = true;
  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  selectedShiftType: ShiftType | null = null;
  organizations: Organization[] = [];
  isSuperAdmin = false;
  private translations: any = {};

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private shiftTypeService: ShiftTypeService,
    private organizationService: LookupService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });
    this.isSuperAdmin = this.checkIsSuperAdmin();
    this.loadShiftTypes();
    this.loadOrganizations();
  }

  private checkIsSuperAdmin(): boolean {
    const claims = this.authService.getClaims();
    return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
  }

  loadOrganizations(): void {
    this.organizationService.getAllOrganizations().subscribe({
      next: (response: ApiResponse<Organization[]>) => {
        if (response.succeeded) this.organizations = response.data;
      },
      error: (error) => console.error('Error loading organizations:', error)
    });
  }

  loadShiftTypes() {
    this.loading = true;
    this.shiftTypeService.getAllShiftTypes().subscribe({
      next: (response: ApiResponse<ShiftType[]>) => {
        if (response.succeeded) {
          this.shiftTypes = response.data;
        } else {
          this.showToast('error', this.translations.common?.error, response.message || this.translations.shiftTypeList?.toasts?.loadError);
        }
        this.loading = false;
      },
      error: (error) => {
        this.showToast('error', this.translations.common?.error, this.translations.shiftTypeList?.toasts?.loadError);
        this.loading = false;
      }
    });
  }

  getStatus(shiftType: ShiftType): string {
    return shiftType.isDeleted ? 'inactive' : 'active';
  }

  getSeverity(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      default: return 'info';
    }
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.selectedShiftType = null;
    this.dialogVisible = true;
  }

  openEditDialog(shiftType: ShiftType) {
    this.isEditMode = true;
    this.selectedShiftType = shiftType;
    this.dialogVisible = true;
  }

  onShiftTypeSaved(shiftType: ShiftType) {
    this.loadShiftTypes();
  }

  deleteShiftType(shiftType: ShiftType) {
    const commonTrans = this.translations.common || {};
    const shiftTypeTrans = this.translations.shiftTypeList?.messages || {};
    const message = (shiftTypeTrans.deleteConfirm || 'Are you sure you want to delete {name}?').replace('{name}', shiftType.name);

    this.confirmationService.confirm({
      message: message,
      header: commonTrans.deleteHeader || 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.shiftTypeService.deleteShiftType(shiftType.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.showToast('success', commonTrans.success, this.translations.shiftTypeList?.toasts?.deleteSuccess);
              this.loadShiftTypes();
            } else {
              this.showToast('error', commonTrans.error, response.message || this.translations.shiftTypeList?.toasts?.deleteError);
            }
          },
          error: (error) => {
            this.showToast('error', commonTrans.error, this.translations.shiftTypeList?.toasts?.deleteError);
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