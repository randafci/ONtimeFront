import { Routes } from '@angular/router';
import { EmployeePolicyListComponent } from './employee-policy-list/employee-policy-list';
import { AddOrEditEmployeePolicyComponent } from './add-or-edit-employee-policy/add-or-edit-employee-policy';

export const EMPLOYEE_POLICY_ROUTES: Routes = [
    {
        path: '',
        component: EmployeePolicyListComponent
    },
    {
        path: 'add',
        component: AddOrEditEmployeePolicyComponent
    },
    {
        path: 'edit/:id',
        component: AddOrEditEmployeePolicyComponent
    }
];

