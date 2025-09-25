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
import { Holiday } from '../../../interfaces/holiday.interface';
import { HolidayTypeList } from '../../../interfaces/holiday-type.interface';
import { HolidayService } from '../HolidayService';
import { HolidayTypeService } from '../HolidayTypeService';
import { Router, RouterModule } from "@angular/router";
import { DatePipe } from '@angular/common';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { HolidayModalComponent } from '../holiday-modal/holiday-modal.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-holiday-list',
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
    HolidayModalComponent,
    TranslatePipe
  ],
  providers: [MessageService, ConfirmationService, TranslatePipe],
  templateUrl: './holiday-list.html'
})
export class HolidayListComponent implements OnInit {
  holidays: Holiday[] = [];
  loading: boolean = true;

  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  selectedHoliday: Holiday | null = null;
  holidayTypes: HolidayTypeList[] = [];
  isSuperAdmin = false;

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private holidayService: HolidayService,
    private holidayTypeService: HolidayTypeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private authService: AuthService,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit() {
    this.isSuperAdmin = this.checkIsSuperAdmin();
    this.loadHolidays();
    this.loadHolidayTypes();
  }

  private checkIsSuperAdmin(): boolean {
    const claims = this.authService.getClaims();
    return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
  }

  loadHolidays() {
    this.loading = true;
    this.holidayService.getAllHolidays().subscribe({
      next: (response: ApiResponse<Holiday[]>) => {
        if (response.succeeded) {
          this.holidays = response.data;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.translatePipe.transform('holidayList.messages.loadError')
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.translatePipe.transform('holidayList.messages.loadError')
        });
        this.loading = false;
      }
    });
  }

  loadHolidayTypes(): void {
    this.holidayTypeService.getAllHolidayTypes().subscribe({
      next: (response: ApiResponse<HolidayTypeList[]>) => {
        if (response.succeeded) {
          this.holidayTypes = response.data;
        }
      },
      error: (error) => {
        // Silent error handling
      }
    });
  }

  getHolidayTypeName(holidayTypeId: number): string {
    const holidayType = this.holidayTypes.find(ht => ht.id === holidayTypeId);
    return holidayType ? holidayType.name : 'Unknown';
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.selectedHoliday = null;
    this.dialogVisible = true;
  }

  openEditDialog(holiday: Holiday) {
    this.isEditMode = true;
    this.selectedHoliday = holiday;
    this.dialogVisible = true;
  }

  onHolidaySaved(holiday: Holiday) {
    this.loadHolidays();
  }

  deleteHoliday(holiday: Holiday) {
    const message = this.translatePipe.transform('holidayList.messages.deleteConfirm').replace('{name}', holiday.symbol);
    this.confirmationService.confirm({
      message: message,
      header: this.translatePipe.transform('common.deleteHeader'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.holidayService.deleteHoliday(holiday.id).subscribe({
          next: (response: ApiResponse<boolean>) => {
            if (response.succeeded) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: this.translatePipe.transform('holidayList.messages.deleteSuccess')
              });
              this.loadHolidays();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || this.translatePipe.transform('holidayList.messages.deleteError')
              });
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.translatePipe.transform('holidayList.messages.deleteError')
            });
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
