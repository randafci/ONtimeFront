import { Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EmployeePolicy, PolicyType } from '../../../interfaces/employee-policy.interface';
import { EmployeePolicyService } from '../EmployeePolicyService';
import { Router, RouterModule, ActivatedRoute } from "@angular/router";
import { DatePipe } from '@angular/common';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';

@Component({
    selector: 'app-employee-policy-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        InputTextModule,
        TagModule,
        ButtonModule,
        InputIconModule,
        IconFieldModule,
        ToastModule,
        RouterModule,
        ConfirmDialogModule,
        TooltipModule,
        TranslatePipe,
        DatePipe
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './employee-policy-list.html',
    styleUrl: './employee-policy-list.scss'
})
export class EmployeePolicyListComponent implements OnInit {
    @Input() employeeId?: number;
    @Input() employmentId?: number;

    employeePolicies: EmployeePolicy[] = [];
    loading: boolean = true;
    private translations: any = {};

    @ViewChild('dt') table!: Table;
    @ViewChild('filter') filter!: ElementRef;

    constructor(
        private employeePolicyService: EmployeePolicyService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private route: ActivatedRoute,
        private translationService: TranslationService
    ) {}

    ngOnInit() {
        this.translationService.translations$.subscribe(trans => {
            this.translations = trans;
        });

        // Get employeeId or employmentId from route params if not provided as input
        this.route.params.subscribe(params => {
            if (!this.employeeId && params['employeeId']) {
                this.employeeId = +params['employeeId'];
            }
            if (!this.employmentId && params['employmentId']) {
                this.employmentId = +params['employmentId'];
            }
            this.loadEmployeePolicies();
        });
    }

    loadEmployeePolicies() {
        this.loading = true;
        let observable;

        if (this.employmentId) {
            observable = this.employeePolicyService.getEmployeePoliciesByEmploymentId(this.employmentId);
        } else if (this.employeeId) {
            observable = this.employeePolicyService.getEmployeePoliciesByEmployeeId(this.employeeId);
        } else {
            observable = this.employeePolicyService.getAllEmployeePolicies();
        }

        observable.subscribe({
            next: (response: ApiResponse<EmployeePolicy[]>) => {
                if (response.succeeded) {
                    this.employeePolicies = response.data;
                } else {
                    this.showToast('error', 'Error', response.message || 'Failed to load employee policies');
                }
                this.loading = false;
            },
            error: (error) => {
                this.showToast('error', 'Error', 'Failed to load employee policies');
                this.loading = false;
            }
        });
    }

    getPolicyTypeName(type: PolicyType): string {
        return type === PolicyType.General ? 'General Policy' : 'Permission Policy';
    }

    getPolicyTypeSeverity(type: PolicyType): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" {
        return type === PolicyType.General ? 'info' : 'success';
    }

    isActive(policy: EmployeePolicy): boolean {
        const now = new Date();
        const startDate = new Date(policy.startDateTime);
        const endDate = new Date(policy.endDateTime);
        return now >= startDate && now <= endDate;
    }

    getStatusSeverity(policy: EmployeePolicy): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" {
        return this.isActive(policy) ? 'success' : 'secondary';
    }

    getStatusLabel(policy: EmployeePolicy): string {
        return this.isActive(policy) ? 'Active' : 'Inactive';
    }

    navigateToAdd() {
        if (this.employmentId) {
            this.router.navigate(['/employees/policies/add'], { 
                queryParams: { employmentId: this.employmentId } 
            });
        } else if (this.employeeId) {
            this.router.navigate(['/employees/policies/add'], { 
                queryParams: { employeeId: this.employeeId } 
            });
        } else {
            this.router.navigate(['/employees/policies/add']);
        }
    }

    navigateToEdit(id: number) {
        this.router.navigate(['/employees/policies/edit', id]);
    }

    deleteEmployeePolicy(policy: EmployeePolicy) {
        const trans = this.translations.employeePolicies?.listPage?.messages || {};
        const commonTrans = this.translations.common || {};
        const message = trans.deleteConfirm || 'Are you sure you want to delete this policy assignment?';

        this.confirmationService.confirm({
            message: message,
            header: commonTrans.confirmDelete || 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: commonTrans.yes || 'Yes',
            rejectLabel: commonTrans.no || 'No',
            accept: () => {
                this.employeePolicyService.deleteEmployeePolicy(policy.id).subscribe({
                    next: (response: ApiResponse<boolean>) => {
                        if (response.succeeded) {
                            const successMsg = trans.deleteSuccess || 'Policy assignment deleted successfully.';
                            this.showToast('success', commonTrans.success, successMsg);
                            this.loadEmployeePolicies();
                        } else {
                            this.showToast('error', commonTrans.error, response.message || trans.deleteError);
                        }
                    },
                    error: () => this.showToast('error', commonTrans.error, trans.deleteError)
                });
            },
            reject: () => {
                this.showToast('info', trans.cancelled || 'Cancelled', trans.deleteCancelled);
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

