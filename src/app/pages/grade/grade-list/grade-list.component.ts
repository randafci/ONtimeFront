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
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Grade } from '@/interfaces/grade.interface';
import { GradeService } from '../GradeService';
import { ApiResponse } from '@/core/models/api-response.model';
import { AuthService } from '../../../auth/auth.service';
import { LookupService } from '../../organization/OrganizationService';
import { Organization } from '../../../interfaces/organization.interface';
import { GradeModalComponent } from '../grade-modal/grade-modal.component';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
@Component({
    selector: 'app-grade-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, DatePipe,
        TableModule, ButtonModule, InputTextModule, ToastModule, ConfirmDialogModule, TagModule,
        IconFieldModule, InputIconModule, SelectModule,
        TranslatePipe, GradeModalComponent
    ],
    providers: [MessageService, ConfirmationService, TranslatePipe],
    templateUrl: './grade-list.component.html',
})
export class GradeListComponent implements OnInit {
    grades: Grade[] = [];
    loading: boolean = true;
    dialogVisible: boolean = false;
    isEditMode: boolean = false;
    selectedGrade: Grade | null = null;
    organizations: Organization[] = [];
    isSuperAdmin: boolean = false;
    private translations: any = {};

    @ViewChild('dt') table!: Table;
    @ViewChild('filter') filter!: ElementRef;

    constructor(
        private gradeService: GradeService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private authService: AuthService,
        private organizationService: LookupService,
        private translationService: TranslationService
    ) {}

    ngOnInit() {
        this.translationService.translations$.subscribe(translations => {
            this.translations = translations;
        });
        this.isSuperAdmin = this.checkIsSuperAdmin();
        if (this.isSuperAdmin) {
            this.loadOrganizations();
        }
        this.loadGrades();
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
                    this.showToast('error', this.translations.common?.error, this.translations.gradeList?.toasts?.orgLoadError);
                }
            },
            error: () => {
                this.showToast('error', this.translations.common?.error, this.translations.gradeList?.toasts?.orgLoadError);
            }
        });
    }

    loadGrades() {
        this.loading = true;
        this.gradeService.getAllGrades().subscribe({
            next: (response: ApiResponse<Grade[]>) => {
                if (response.succeeded && response.data) {
                    this.grades = response.data;
                } else {
                    this.showToast('error', this.translations.common?.error, response.message || this.translations.gradeList?.toasts?.loadError);
                }
                this.loading = false;
            },
            error: (err) => {
                this.showToast('error', this.translations.common?.error, this.translations.gradeList?.toasts?.loadError);
                this.loading = false;
            }
        });
    }

    getStatus(grade: Grade): string {
        return grade.isDeleted ? 'inactive' : 'active';
    }

    getSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" {
        return status === 'active' ? 'success' : 'danger';
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
        const commonTrans = this.translations.common || {};
        const gradeTrans = this.translations.gradeList?.toasts || {};
        const message = (commonTrans.deleteConfirm || 'Are you sure you want to delete {name}?').replace('{name}', grade.name);

        this.confirmationService.confirm({
            message: message,
            header: commonTrans.deleteHeader || 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.gradeService.deleteGrade(grade.id).subscribe({
                    next: () => {
                        this.showToast('success', commonTrans.success, gradeTrans.deleteSuccess);
                        this.loadGrades();
                    },
                    error: (err) => {
                        this.showToast('error', commonTrans.error, err.error?.message || gradeTrans.deleteError);
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