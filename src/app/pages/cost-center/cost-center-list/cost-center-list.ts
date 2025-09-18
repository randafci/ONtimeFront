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
import { MessageService } from 'primeng/api';
import { CostCenter } from '../../../interfaces/cost-center.interface';
import { CostCenterService } from '../CostCenterService';
import { Router, RouterModule } from "@angular/router";
import { DatePipe } from '@angular/common';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-cost-center-list',
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
    TranslatePipe
  ],
  providers: [MessageService],
  templateUrl: './cost-center-list.html'
})
export class CostCenterListComponent implements OnInit {
  costCenters: CostCenter[] = [];
  loading: boolean = true;


  integrationOptions: any[] = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];

  activityValues: number[] = [0, 100];

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private costCenterService: CostCenterService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCostCenters();
  }

  loadCostCenters() {
    this.loading = true;
    this.costCenterService.getAllCostCenters().subscribe({
      next: (response: ApiResponse<CostCenter[]>) => {
        if (response.succeeded) {
          this.costCenters = response.data;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load cost centers'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cost centers:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load cost centers'
        });
        this.loading = false;
      }
    });
  }

  


  getIntegrationSeverity(fromIntegration: boolean) {
    return fromIntegration ? 'warning' : 'info';
  }

  navigateToAdd() {
    this.router.navigate(['/cost-centers/add']);
  }

  navigateToEdit(id: number) {
    this.router.navigate(['/cost-centers/edit', id]);
  }

  deleteCostCenter(costCenter: CostCenter) {
    // Implement delete logic here
    console.log('Deleting cost center:', costCenter);
    this.messageService.add({
      severity: 'warn',
      summary: 'Delete',
      detail: `Are you sure you want to delete ${costCenter.name}?`,
      life: 3000
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
