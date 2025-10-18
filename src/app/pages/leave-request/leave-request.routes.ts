import { Routes } from '@angular/router';
import { LeaveRequestListComponent } from './leave-request-list/leave-request-list';

export const LEAVE_REQUEST_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: LeaveRequestListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
