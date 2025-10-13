import { Routes } from '@angular/router';
import { EmployeeListComponent } from './employee-list/employee-list';
import { AddEditEmployeeComponent } from './add-or-edit-employee/add-or-edit-employee';
import { EmployeeEmploymentListComponent } from './employee-employment-list/employee-employment-list';
import { EmployeeShiftAssignmentComponent } from './employee-shift-assignment/employee-shift-assignment';

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
    },
    {
        path: 'employments/:employeeId/:employeeName',
        component: EmployeeEmploymentListComponent
    },
    {
        path: 'shift-assignments/:employeeId/:employeeName',
        component: EmployeeShiftAssignmentComponent
    },
];
