import { Component, OnInit } from '@angular/core';
import { AccountService, AdminUser, ApiResponse } from '../AccountService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
import { RatingModule } from 'primeng/rating';
import { SliderModule } from 'primeng/slider';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TranslatePipe } from '@/core/pipes/translate.pipe';

@Component({
  selector: 'app-organization-list',
  imports: [     TableModule,
        MultiSelectModule,
        SelectModule,
        InputIconModule,
        TagModule,
        InputTextModule,
        SliderModule,
        ProgressBarModule,
        ToggleButtonModule,
        ToastModule,
        CommonModule,
        FormsModule,
        ButtonModule,
        RatingModule,
        RippleModule,
        TranslatePipe,
        IconFieldModule],
  templateUrl: './organization-list.html',
  styleUrl: './organization-list.scss'
})
export class OrganizationList implements OnInit {
  admins: AdminUser[] = [];
  loading = true;
  error: string | null = null;

  constructor(private accountService: AccountService) { }

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.loading = true;
    this.error = null;
    
    this.accountService.getAllAdmins().subscribe({
      next: (response: ApiResponse<AdminUser>) => {
        if (response.succeeded) {
          this.admins = response.data;
        } else {
          this.error = response.message || 'Failed to load admins';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'An error occurred while fetching admins';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
