import { Routes } from '@angular/router';
import { DepartmentListComponent } from './department-list/department-list';

export const DEPARTMENT_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: DepartmentListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
