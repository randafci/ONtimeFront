import { Routes } from '@angular/router';
import { EmployeeListComponent } from './employee-list/employee-list';
import { AddEditEmployeeComponent } from './add-or-edit-employee/add-or-edit-employee';

export const EMPLOYEE_ROUTES: Routes = [
    {
        path: '',
        component: EmployeeListComponent
    },
    {
        path: 'add',
        component: AddEditEmployeeComponent
    },
    {
        path: 'edit/:id',
        component: AddEditEmployeeComponent
    }
];
