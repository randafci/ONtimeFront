import { Routes } from '@angular/router';
import { PermissionRequestListComponent } from './permission-request-list/permission-request-list';

export const PERMITION_REQUESTS_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: PermissionRequestListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
