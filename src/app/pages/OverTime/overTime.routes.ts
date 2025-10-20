// organization.routes.ts
import { Routes } from '@angular/router';
import { OverTimeListComponent } from './over-time-list/over-time-list';
import { AddOrEditOverTime } from './add-or-edit-over-time/add-or-edit-over-time';

export const OVER_TIME_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: OverTimeListComponent },
            { path: 'add', component: AddOrEditOverTime },
            { path: 'edit/:id', component: AddOrEditOverTime },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];