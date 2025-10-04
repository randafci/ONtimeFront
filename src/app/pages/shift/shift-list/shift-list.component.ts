
// src/app/features/attendance/shifts/shift-list/shift-list.component.ts

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiResponse } from '@/core/models/api-response.model';
import { AuthService } from '@/auth/auth.service';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { TranslationService } from '@/pages/translation-manager/translation-manager/translation.service';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

// Project Specific Imports
import { ShiftService } from '../ShiftService';
import { ShiftModalComponent } from '../shift-modal/shift-modal.component';
import { LookupService } from '../../organization/OrganizationService';
import { Shift } from '../../../interfaces/shift.interface';
import { Organization } from '../../../interfaces/organization.interface';
import { ShiftType } from '../../../interfaces/shift-type.interface';
import { ShiftTypeService } from '../../shift-type/shift-type.service';

@Component({
  selector: 'app-shift-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, TranslatePipe,
    TableModule, ButtonModule, InputTextModule, ToastModule, ConfirmDialogModule, TagModule, IconFieldModule, InputIconModule,
    ShiftModalComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './shift-list.component.html',
  styleUrls: ['./shift-list.component.scss']
})
export class ShiftListComponent implements OnInit {
  shifts: Shift[] = [];
  loading: boolean = true;
  isSuperAdmin: boolean = false;

  // Dialog properties
  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  selectedShift: Shift | null = null;
  
  // Data for dropdowns in the modal
  organizations: Organization[] = [];
  shiftTypes: ShiftType[] = [];
  private translations: any = {};

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private shiftService: ShiftService,
    private organizationService: LookupService,
    private shiftTypeService: ShiftTypeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    this.translationService.translations$.subscribe((translations: any) => {
      this.translations = translations;
    });
    this.isSuperAdmin = this.checkIsSuperAdmin();
    this.loadShifts();
    this.loadDropdownData(); // Still needed for the modal
  }

  private checkIsSuperAdmin(): boolean {
    const claims = this.authService.getClaims();
    return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
  }
  
  // This method remains to populate the create/edit modal dropdowns.
  loadDropdownData(): void {
    this.organizationService.getAllOrganizations().subscribe(res => {
      if (res.succeeded) this.organizations = res.data;
    });
    this.shiftTypeService.getAllShiftTypes().subscribe((res: ApiResponse<ShiftType[]>) => {
      if (res.succeeded) this.shiftTypes = res.data;
    });
  }

  // This method is now much simpler.
  loadShifts() {
    this.loading = true;
    this.shiftService.getAllShifts().subscribe({
      next: (response: ApiResponse<Shift[]>) => {
        if (response.succeeded) {
          // No more mapping needed! The backend provides the names directly.
          this.shifts = response.data || [];
        } else {
          this.showToast('error', this.translations.common?.error, response.message || 'Failed to load shifts.');
        }
        this.loading = false;
      },
      error: () => {
        this.showToast('error', this.translations.common?.error, 'An unexpected error occurred while loading shifts.');
        this.loading = false;
      }
    });
  }

  getSeverity(isDefault: boolean): "success" | "info" {
    return isDefault ? 'success' : 'info';
  }
  
  openCreateDialog() {
    this.isEditMode = false;
    this.selectedShift = null;
    this.dialogVisible = true;
  }

  openEditDialog(shift: Shift) {
    this.isEditMode = true;
    this.selectedShift = { ...shift };
    this.dialogVisible = true;
  }

  onShiftSaved(savedShift: Shift) {
    this.loadShifts(); // Simply reload the list
    this.dialogVisible = false;
  }

  deleteShift(shift: Shift) {
    const commonTrans = this.translations.common || {};
    const shiftTrans = this.translations.shiftList?.messages || {};
    const message = shiftTrans.deleteConfirm || 'Are you sure you want to delete this shift?';

    this.confirmationService.confirm({
      message: message,
      header: commonTrans.deleteHeader || 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.shiftService.deleteShift(shift.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.showToast('success', commonTrans.success, 'Shift deleted successfully.');
              this.loadShifts();
            } else {
              this.showToast('error', commonTrans.error, response.message || 'Failed to delete shift.');
            }
          },
          error: () => this.showToast('error', commonTrans.error, 'Failed to delete shift.')
        });
      }
    });
  }
  
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    if (this.filter) {
      this.filter.nativeElement.value = '';
    }
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail: detail || 'An unknown error occurred.' });
  }
}
