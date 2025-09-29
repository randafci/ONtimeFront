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
import { RamadanPeriod, CreateRamadanPeriod, EditRamadanPeriod } from '@/interfaces/ramadan-period.interface';
import { RamadanPeriodService } from '../RamadanPeriodService';
import { Router, RouterModule } from "@angular/router";
import { DatePipe } from '@angular/common';
import { ApiResponse } from '@/core/models/api-response.model';
import { AuthService } from '@/auth/auth.service';
import { RamadanPeriodModalComponent } from '../ramadan-period-modal/ramadan-period-modal.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-ramadan-period-list',
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
    DatePipe,
    ConfirmDialogModule,
    RamadanPeriodModalComponent,
    TranslatePipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './ramadan-period-list.html'
})
export class RamadanPeriodListComponent implements OnInit {
  ramadanPeriods: RamadanPeriod[] = [];
  loading: boolean = true;
  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  selectedRamadanPeriod: RamadanPeriod | null = null;
  private translations: any = {};

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private ramadanPeriodService: RamadanPeriodService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });
    this.loadRamadanPeriods();
  }

  loadRamadanPeriods() {
    this.loading = true;
    this.ramadanPeriodService.getAllRamadanPeriods().subscribe({
      next: (response: ApiResponse<RamadanPeriod[]>) => {
        if (response.succeeded) {
          this.ramadanPeriods = response.data;
        } else {
          this.showToast('error', this.translations.common?.error, response.message || this.translations.ramadanPeriodList?.messages?.loadError);
        }
        this.loading = false;
      },
      error: (error) => {
        this.showToast('error', this.translations.common?.error, this.translations.ramadanPeriodList?.messages?.loadError);
        this.loading = false;
      }
    });
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.selectedRamadanPeriod = null;
    this.dialogVisible = true;
  }

  openEditDialog(ramadanPeriod: RamadanPeriod) {
    this.isEditMode = true;
    this.selectedRamadanPeriod = ramadanPeriod;
    this.dialogVisible = true;
  }

  onRamadanPeriodSaved(ramadanPeriod: RamadanPeriod) {
    this.loadRamadanPeriods();
  }

  deleteRamadanPeriod(ramadanPeriod: RamadanPeriod) {
    const trans = this.translations.ramadanPeriodList?.messages || {};
    const commonTrans = this.translations.common || {};
    const message = (trans.deleteConfirm || 'Are you sure you want to delete {name}?').replace('{name}', ramadanPeriod.name);

    this.confirmationService.confirm({
      message: message,
      header: commonTrans.deleteHeader || 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.ramadanPeriodService.deleteRamadanPeriod(ramadanPeriod.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.showToast('success', commonTrans.success, trans.deleteSuccess);
              this.loadRamadanPeriods();
            } else {
              this.showToast('error', commonTrans.error, response.message || trans.deleteError);
            }
          },
          error: () => this.showToast('error', commonTrans.error, trans.deleteError)
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
