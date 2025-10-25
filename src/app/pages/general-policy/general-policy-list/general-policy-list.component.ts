import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../translation-manager/translation-manager/translation.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { GeneralPolicyDto } from '../../../interfaces/general-policy.interface';
import { GeneralPolicyService } from '../general-policy.service';

@Component({
  selector: 'app-general-policy-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, TableModule, ButtonModule,
    InputTextModule, ToastModule, TagModule, IconFieldModule, InputIconModule,
    TooltipModule, ConfirmDialogModule, TranslatePipe
  ],
  providers: [MessageService, ConfirmationService, GeneralPolicyService],
  templateUrl: './general-policy-list.component.html',
  styleUrls: ['./general-policy-list.component.scss']
})
export class GeneralPolicyListComponent implements OnInit {
  policies: GeneralPolicyDto[] = [];
  loading: boolean = true;
  private translations: any = {};

  @ViewChild('dt') table!: Table;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private policyService: GeneralPolicyService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translationService: TranslationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });
    this.loadPolicies();
  }

  loadPolicies() {
    this.loading = true;
    this.policyService.getAllGeneralPolicies().subscribe({
      next: (response: ApiResponse<GeneralPolicyDto[]>) => {
        if (response.succeeded) {
          this.policies = response.data;
        } else {
          this.showToast('error', this.translations.common?.error, response.message || this.translations.policies?.listPage?.messages?.loadError);
        }
        this.loading = false;
      },
      error: () => {
        this.showToast('error', this.translations.common?.error, this.translations.policies?.listPage?.messages?.loadError);
        this.loading = false;
      }
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    if (this.filter) this.filter.nativeElement.value = '';
  }

  navigateToAdd() {
    this.router.navigate(['/general-policy/add']); // Assuming this is the correct add route
  }
  
  navigateToEdit(id: string) {
    this.router.navigate(['/general-policy/edit', id]); // Assuming this is the correct edit route
  }
  
  duplicatePolicy(policy: GeneralPolicyDto) {
     this.showToast('info', 'Info', 'Duplicate feature not yet implemented.');
  }

  deletePolicy(policy: GeneralPolicyDto) {
    const trans = this.translations.policies?.listPage?.messages || {};
    const commonTrans = this.translations.common || {};
    const message = (trans.deleteConfirm || 'Are you sure you want to delete {name}?').replace('{name}', policy.nameEn || 'this policy');
    
    this.confirmationService.confirm({
      message: message,
      header: commonTrans.confirmDelete || 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.policyService.deleteGeneralPolicy(policy.id).subscribe({
          next: (res: ApiResponse<boolean>) => {
            if (res.succeeded) {
              this.showToast('success', commonTrans.success, trans.deleteSuccess);
              this.loadPolicies();
            } else {
              this.showToast('error', commonTrans.error, res.message || trans.deleteError);
            }
          },
          error: () => this.showToast('error', commonTrans.error, trans.deleteError)
        });
      }
    });
  }
  
  makeAsDefault(policy: GeneralPolicyDto) {
    const trans = this.translations.policies?.listPage?.messages || {};
    const commonTrans = this.translations.common || {};
    const message = (trans.markDefaultConfirm || 'Are you sure you want to mark {name} as default?').replace('{name}', policy.nameEn || 'this policy');

    this.confirmationService.confirm({
      message: message,
      header: commonTrans.confirm || 'Confirm',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.policyService.makeDefault(policy.id).subscribe({
          next: (res: ApiResponse<boolean>) => {
            if (res.succeeded) {
              this.showToast('success', commonTrans.success, trans.markDefaultSuccess);
              this.loadPolicies();
            } else {
               this.showToast('error', commonTrans.error, res.message || trans.updateError);
            }
          },
          error: () => this.showToast('error', commonTrans.error, trans.updateError)
        });
      }
    });
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}