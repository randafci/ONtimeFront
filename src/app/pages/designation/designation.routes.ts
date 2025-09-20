import { Routes } from '@angular/router';
import { DesignationListComponent } from './designation-list/designation-list';

export const DESIGNATION_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: DesignationListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
