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
import { ShiftType } from '../../../interfaces/shift-type.interface';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { ApiResponse } from '../../../core/models/api-response.model';
import { ShiftTypeService } from '../shift-type.service';

@Component({
  selector: 'app-shift-type-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, DatePipe,
    TableModule, ButtonModule, InputTextModule, ToastModule, TagModule,
    IconFieldModule, InputIconModule,
    TranslatePipe
  ],
  providers: [MessageService, ConfirmationService, TranslatePipe],
  templateUrl: './shift-type-list.component.html',
  styleUrls: ['./shift-type-list.component.scss']
})
export class ShiftTypeListComponent implements OnInit {
  shiftTypes: ShiftType[] = [];
  loading: boolean = true;

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private shiftTypeService: ShiftTypeService,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private translatePipe: TranslatePipe
  ) {}

  ngOnInit() {
    this.loadShiftTypes();
  }

  loadShiftTypes() {
    this.loading = true;
    this.shiftTypeService.getAllShiftTypes().subscribe({
      next: (response: ApiResponse<ShiftType[]>) => {
        if (response.succeeded && response.data) {
          this.shiftTypes = response.data;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message || 'Failed to load shift types' });
        }
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load shift types' });
        this.loading = false;
      }
    });
  }

  getStatus(shiftType: ShiftType): string {
    return shiftType.isDeleted ? 'inactive' : 'active';
  }

  getSeverity(status: string): string {
    return status === 'active' ? 'success' : 'danger';
  }

  navigateToAdd() {
    this.router.navigate(['/shift-types/add']);
  }

  navigateToEdit(id: number) {
    this.router.navigate(['/shift-types/edit', id]);
  }

  deleteShiftType(shiftType: ShiftType) {
    const message = this.translatePipe.transform('common.deleteConfirm').replace('{name}', shiftType.name);
    this.confirmationService.confirm({
      message: message,
      header: this.translatePipe.transform('common.deleteHeader'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.shiftTypeService.deleteShiftType(shiftType.id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Shift Type deleted successfully.' });
                this.loadShiftTypes(); 
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to delete shift type.' });
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