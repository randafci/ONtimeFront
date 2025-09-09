import { Routes } from '@angular/router';
import { DesignationListComponent } from './designation-list/designation-list';
import { AddOrEditDesignation } from './add-or-edit-designation/add-or-edit-designation';

export const DESIGNATION_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: DesignationListComponent },
            { path: 'add', component: AddOrEditDesignation },
            { path: 'edit/:id', component: AddOrEditDesignation },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
