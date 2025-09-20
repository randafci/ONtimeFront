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
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Grade } from '@/interfaces/grade.interface';
import { GradeService } from '../GradeService';
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { ApiResponse } from '@/core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { LookupService } from '../../organization/OrganizationService';
import { Organization } from '../../../interfaces/organization.interface';
import { GradeModalComponent } from '../grade-modal/grade-modal.component';
@Component({
    selector: 'app-grade-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, DatePipe,
        TableModule, ButtonModule, InputTextModule, ToastModule, TagModule,
        IconFieldModule, InputIconModule, SelectModule,
        TranslatePipe, GradeModalComponent
    ],
    providers: [MessageService, ConfirmationService, TranslatePipe],
    templateUrl: './grade-list.component.html',
})
export class GradeListComponent implements OnInit {
    grades: Grade[] = [];
    loading: boolean = true;

    // Dialog properties
    dialogVisible: boolean = false;
    isEditMode: boolean = false;
    selectedGrade: Grade | null = null;
    organizations: Organization[] = [];
    isSuperAdmin: boolean = false;

    @ViewChild('dt') table!: Table;
    @ViewChild('filter') filter!: ElementRef;
    constructor(
        private gradeService: GradeService,
        private messageService: MessageService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private translatePipe: TranslatePipe,
        private authService: AuthService,
        private organizationService: LookupService
    ) {}
    ngOnInit() {
        this.isSuperAdmin = this.checkIsSuperAdmin();
        if (this.isSuperAdmin) {
            this.loadOrganizations();
        }
        this.loadGrades();
    }

    loadGrades() {
        this.loading = true;
        this.gradeService.getAllGrades().subscribe({
            next: (response: ApiResponse<Grade[]>) => {
                if (response.succeeded && response.data) {
                    this.grades = response.data;
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message || 'Failed to load grades' });
                }
                this.loading = false;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load grades' });
                this.loading = false;
            }
        });
    }
    getStatus(grade: Grade): string {
        return grade.isDeleted ? 'inactive' : 'active';
    }
    getSeverity(status: string): string {
        return status === 'active' ? 'success' : 'danger';
    }
    private checkIsSuperAdmin(): boolean {
        const claims = this.authService.getClaims();
        return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
    }

    loadOrganizations(): void {
        this.organizationService.getAllOrganizations().subscribe({
            next: (response: ApiResponse<Organization[]>) => {
                if (response.succeeded && response.data) {
                    this.organizations = response.data;
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load organizations.' });
                }
            }
        });
    }

    openCreateDialog() {
        this.isEditMode = false;
        this.selectedGrade = null;
        this.dialogVisible = true;
    }

    openEditDialog(grade: Grade) {
        this.isEditMode = true;
        this.selectedGrade = grade;
        this.dialogVisible = true;
    }

    onGradeSaved(grade: Grade): void {
        this.loadGrades();
    }

  
    deleteGrade(grade: Grade) {
        const message = this.translatePipe.transform('common.deleteConfirm').replace('{name}', grade.name);
        this.confirmationService.confirm({
            message: message,
            header: this.translatePipe.transform('common.deleteHeader'),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.gradeService.deleteGrade(grade.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Grade deleted successfully.' });
                        this.loadGrades();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to delete grade.' });
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