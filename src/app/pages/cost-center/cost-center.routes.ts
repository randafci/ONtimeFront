import { Routes } from '@angular/router';
import { CostCenterListComponent } from './cost-center-list/cost-center-list';

export const COST_CENTER_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: CostCenterListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
