import { Routes } from '@angular/router';
import { CompanyListComponent } from './company-list/company-list';
import { AddOrEditCompany } from './add-or-edit-company/add-or-edit-company';

export const COMPANY_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: CompanyListComponent },
            { path: 'add', component: AddOrEditCompany },
            { path: 'edit/:id', component: AddOrEditCompany },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
