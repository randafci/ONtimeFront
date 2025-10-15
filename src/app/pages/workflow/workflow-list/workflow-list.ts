import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { Workflow, WorkflowType, RequesterType } from '@/interfaces/workflow.interface';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { WorkflowService } from '../workflow.service';
import { PagedListRequest } from '@/core/models/api-response.model';

@Component({
  selector: 'app-workflow-list',
  imports: [    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    RippleModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    TranslatePipe,
    RouterLink,
    IconField,
    InputIcon,
    SelectModule,
    Tag],
  templateUrl: './workflow-list.html',
  styleUrl: './workflow-list.scss',
  providers: [ConfirmationService, MessageService]

})
export class WorkflowList implements OnInit {
  @ViewChild('dt') dt!: Table;

  workflows: Workflow[] = [];
  loading = true;
  totalRecords = 0;
  rows = 10;
  first = 0;
  searchValue = '';
  private translations: any = {};

  constructor(
    private workflowService: WorkflowService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  /** Load initial data */
  loadInitialData(): void {
    const event: TableLazyLoadEvent = { first: this.first, rows: this.rows };
    this.loadWorkflows(event);
  }

  /** Load workflows with pagination */
  loadWorkflows(event: TableLazyLoadEvent): void {
    this.loading = true;
    const page = (event.first || 0) / (event.rows || 10) + 1;

     const request: PagedListRequest = {
          page: page,
          pageSize: event.rows || 10,
          filter: {
            sortField: event.sortField as string || 'Id',
            sortDirection: event.sortOrder === 1 ? 1 : -1,
            logic: 'or',
            filters: this.searchValue ? [{ field: 'workflowName', operator: 'contains', value: this.searchValue }] : []
          }
        };

this.workflowService.getAllPaged(request).subscribe({
  next: (response) => {
    console.log(response);
    if (response.succeeded && response.data) {
      this.workflows = response.data.items || [];
      this.totalRecords = response.data.totalCount || 0;
    } else {
      this.showToast('error', 'Error', response.message || 'Failed to load workflows');
    }
    this.loading = false;
  },
  error: (err) => {
    this.loading = false;
    this.showToast('error', 'Error', err.error?.message || 'Failed to load workflows');
  }
});


  }

  /** Global search handler */
  onGlobalFilter(table: Table, event: any): void {
    const value = event.target.value;
    this.searchValue = value;
    this.first = 0;
    table.filterGlobal(value, 'contains');
  }

  /** Clear search & reload */
  clear(table: Table): void {
    this.searchValue = '';
    this.first = 0;
    table.clear();
    this.loadWorkflows({ first: this.first, rows: this.rows });
  }

  /** Edit workflow */
  editWorkflow(workflow: Workflow): void {
    this.router.navigate(['/workflow/edit', workflow.id]);
  }

  /** Delete workflow */
  deleteWorkflow(workflow: Workflow): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete workflow "${workflow.workflowName}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.workflowService.delete(workflow.id).subscribe({
          next: () => {
            this.showToast('success', 'Success', 'Workflow deleted successfully');
            this.loadInitialData();
          },
          error: (err) => {
            this.showToast('error', 'Error', err.error?.message || 'Failed to delete workflow');
          }
        });
      }
    });
  }

  /** Toast utility */
  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

  /** Enum helpers */
  getWorkflowTypeName(type: WorkflowType): string {
    return WorkflowType[type];
  }

  getRequesterTypeName(type: RequesterType): string {
    return RequesterType[type];
  }
}