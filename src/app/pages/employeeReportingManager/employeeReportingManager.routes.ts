import { Routes } from '@angular/router';
import { AddOrEditEmployeeReportingManager } from './add-or-edit-employee-reporting-manager/add-or-edit-employee-reporting-manager';
import { EmployeeReportingManagerList } from './employee-reporting-manager-list/employee-reporting-manager-list';

export const EMPLOYEEREPORTINGMANAGER_ROUTES: Routes = [
    { 
        path: '',
        children: [
             {
                    path: 'add',
                    component: AddOrEditEmployeeReportingManager
                },
                {
                    path: 'edit/:id',
                    component: AddOrEditEmployeeReportingManager
                },
            { path: 'list', component: EmployeeReportingManagerList },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
