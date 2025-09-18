import { Routes } from '@angular/router';
import { CostCenterListComponent } from './cost-center-list/cost-center-list';
import { AddOrEditCostCenter } from './add-or-edit-cost-center/add-or-edit-cost-center';

export const COST_CENTER_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: CostCenterListComponent },
            { path: 'add', component: AddOrEditCostCenter },
            { path: 'edit/:id', component: AddOrEditCostCenter },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
