import { Routes } from '@angular/router';
import { LeaveTypeListComponent } from './leave-type-list/leave-type-list';

export const LEAVE_TYPE_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: LeaveTypeListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
