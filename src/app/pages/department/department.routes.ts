import { Routes } from '@angular/router';
import { DepartmentListComponent } from './department-list/department-list';
import { AddOrEditDepartment } from './add-or-edit-department/add-or-edit-department';

export const DEPARTMENT_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: DepartmentListComponent },
            { path: 'add', component: AddOrEditDepartment },
            { path: 'edit/:id', component: AddOrEditDepartment },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
