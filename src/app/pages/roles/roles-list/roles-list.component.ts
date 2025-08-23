import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { TieredMenuModule } from 'primeng/tieredmenu';

// Import our custom TranslatePipe
import { TranslatePipe } from '@/core/pipes/translate.pipe';
import { RouterLink } from '@angular/router';

// Define an interface for our mock data
export interface IRole {
  id: number;
  name: string;
  isDefaultRole: boolean;
  isHRRole: boolean;
}

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    RippleModule,
    TooltipModule,
    TieredMenuModule,
    TranslatePipe, // Import the pipe
    RouterLink
  ],
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss']
})
export class RolesListComponent implements OnInit {
  // Mock data for the table
  mockRoles: IRole[] = [
    { id: 1, name: 'Integration', isDefaultRole: true, isHRRole: false },
    { id: 2, name: 'Administrator', isDefaultRole: true, isHRRole: false },
    { id: 3, name: 'Test', isDefaultRole: true, isHRRole: false },
    { id: 4, name: 'Support', isDefaultRole: false, isHRRole: true }
  ];

  rolesList: IRole[] = [];
  cols: any[] = [];
  loading = true;

  @ViewChild('filter') filter!: ElementRef;

  constructor() {}

  ngOnInit(): void {
    // Define the columns that the p-table will use
    this.cols = [
      { field: 'name', headerKey: 'rolesList.headers.name' },
      { field: 'isDefaultRole', headerKey: 'rolesList.headers.isDefault' },
      { field: 'isHRRole', headerKey: 'rolesList.headers.isHR' },
      { field: 'actions', headerKey: 'rolesList.headers.actions' }
    ];

    // Simulate an API call to fetch data
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    setTimeout(() => {
      this.rolesList = this.mockRoles;
      this.loading = false;
    }, 1000); // Simulate 1-second network delay
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }

  // --- Mock Action Handlers ---
  // In a real app, these would open dialogs or navigate to other pages.

  deleteRole(role: IRole) {
    console.log('Deleting role:', role.name);
    // In a real app, you would call a confirmation service here.
    this.rolesList = this.rolesList.filter(r => r.id !== role.id);
  }

  // makeAsDefault(role: IRole) {
  //   console.log('Toggling default status for:', role.name);
  //   // In a real app, call a service to update the backend.
  //   this.rolesList.forEach(r => r.isDefaultRole = false);
  //   role.isDefaultRole = true;
  // }
   makeAsDefault(role: IRole) {
    console.log('Toggling default status for:', role.name);

    // Step 1: Remember the original state of the clicked role.
    const wasAlreadyDefault = role.isDefaultRole;

    // Step 2: Reset all roles to be non-default. This is a safe starting point.
    this.rolesList.forEach(r => r.isDefaultRole = false);

    // Step 3: If the role was NOT the default before, make it the new default.
    // If it WAS the default, this condition is false, and it will remain unmarked from Step 2.
    if (!wasAlreadyDefault) {
      role.isDefaultRole = true;
    }

    // In a real app, you would now call a service to save this change.
  }
}