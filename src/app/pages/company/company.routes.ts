import { Routes } from '@angular/router';
import { CompanyListComponent } from './company-list/company-list';

export const COMPANY_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: CompanyListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
