// organization.routes.ts
import { Routes } from '@angular/router';
import { OrganizationListComponent } from './organization-list/organization-list';
import { AddOrEditOrganization } from './add-or-edit-organization/add-or-edit-organization';

export const ORGANIZATION_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: OrganizationListComponent },
            { path: 'add', component: AddOrEditOrganization },
            { path: 'edit/:id', component: AddOrEditOrganization },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];