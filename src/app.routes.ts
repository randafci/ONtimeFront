import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { MenuComponent } from './app/main/menu/menu';
import { Layout } from './app/main/layout/layout';
import { Login } from './app/auth/login/login';
import { AuthGuard } from './app/auth/gurads/auth.guard';
import { LoginGuard } from './app/auth/gurads/login.guard';
import { SuperAdminGuard } from './app/auth/gurads/super-admin.guard';

import { RolesListComponent } from './app/pages/roles/roles-list/roles-list.component';
import { AddEditRoleComponent } from './app/pages/roles/add-role/add-edit-role.component';
import { TranslationManagerComponent } from './app/pages/translation-manager/translation-manager/translation-manager.component';
import { ForgetPassword } from './app/auth/forget-password/forget-password';
import { ChangePassowrd } from './app/auth/change-passowrd/change-passowrd';
import { DeviceListComponent } from './app/pages/device/device-list/device-list.component';
import { AddEditDeviceComponent } from './app/pages/device/add-edit-device/add-edit-device.component';
import { RoleUsersComponent } from './app/pages/roles/role-users/role-users.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: Layout, //AppLayout,
    // canActivate: [AuthGuard], // Protect entire layout
    children: [
      { path: '', component: Dashboard },
      {
        path: 'uikit',
        loadChildren: () => import('./app/pages/uikit/uikit.routes')
      },
      {
        path: 'organizations',
        loadChildren: () =>
          import('./app/pages/organization/oraganization.routes').then(
            (m) => m.ORGANIZATION_ROUTES
          ),
        // canActivate: [SuperAdminGuard]
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./app/pages/user/user.routs').then(
            (m) => m.USER_ROUTES
          )
      },
      {
        path: 'roles',
        component: RolesListComponent,
        canActivate: [SuperAdminGuard]
      },
      {
        path: 'roles/add',
        component: AddEditRoleComponent,
        canActivate: [SuperAdminGuard]
      },
      {
        path: 'roles/edit/:id',
        component: AddEditRoleComponent,
        canActivate: [SuperAdminGuard]
      },
      {
    path: 'roles/:id/users', 
    component: RoleUsersComponent,
    canActivate: [SuperAdminGuard]
  },
      {
        path: 'devices',
        component: DeviceListComponent,
        // canActivate: [SuperAdminGuard]
      },
      { path: 'devices/add', component: AddEditDeviceComponent },
      
{ path: 'devices/edit/:id', component: AddEditDeviceComponent },
      {
        path: 'companies',
        loadChildren: () =>
          import('./app/pages/company/company.routes').then(
            (m) => m.COMPANY_ROUTES
          )
      },
      {
        path: 'designations',
        loadChildren: () =>
          import('./app/pages/designation/designation.routes').then(
            (m) => m.DESIGNATION_ROUTES
          )
      },
      {
        path: 'departments',
        loadChildren: () =>
          import('./app/pages/department/department.routes').then(
            (m) => m.DEPARTMENT_ROUTES
          )
      },
      {
        path: 'families',
        loadChildren: () =>
          import('./app/pages/family/family.routes').then(
            (m) => m.FAMILY_ROUTES
          )
      },
      {
        path: 'grades',
        loadChildren: () =>
          import('./app/pages/grade/grade.routes').then(
            (m) => m.GRADE_ROUTES
          )
      },
      {
        path: 'shift-types',
        loadChildren: () =>
          import('./app/pages/shift-type/shift-type.routes').then(
            (m) => m.SHIFT_TYPE_ROUTES
          )
      },
      {
        path: 'shifts',
        loadChildren: () =>
          import('./app/pages/shift/shift.routes').then(
            (m) => m.SHIFT_ROUTES
          )
      },
      {
        path: 'sections',
        loadChildren: () =>
          import('./app/pages/section/section.routes').then(
            (m) => m.SECTION_ROUTES
          )
      },
      {

        path: 'events',
        loadChildren: () =>
          import('./app/pages/events/events.routes').then(
            (m) => m.EVENTS_ROUTES
          )
      },
       {
        path: 'users',
        loadChildren: () =>
          import('./app/pages/user/user.routs').then(
            (m) => m.USER_ROUTES
          )
      },
      {
        path: 'employees',
        loadChildren: () => import('./app/pages/employee/employee.routes').then
          (m => m.EMPLOYEE_ROUTES)
      },
      { path: 'documentation', component: Documentation },
      {
        path: 'locations',
        loadChildren: () =>
          import('./app/pages/location/location.routes').then(
            (m) => m.LOCATION_ROUTES
          )
      },
      {
        path: 'cost-centers',
        loadChildren: () =>
          import('./app/pages/cost-center/cost-center.routes').then(
            (m) => m.COST_CENTER_ROUTES
          )
      },
      {
        path: 'countries',
        loadChildren: () =>
          import('./app/pages/country/country.routes').then(
            (m) => m.COUNTRY_ROUTES
          )
      },
       {
        path: 'permitions',
        loadChildren: () =>
          import('./app/pages/Permission/permitopn.routs').then(
            (m) => m.PERMITION_ROUTES
          )
      },
      {
        path: 'holidays',
        loadChildren: () =>
          import('./app/pages/holiday/holiday.routes').then(
            (m) => m.HOLIDAY_ROUTES
          )
      },
      {
        path: 'holiday-types',
        loadChildren: () =>
          import('./app/pages/holiday-type/holiday-type.routes').then(
            (m) => m.HOLIDAY_TYPE_ROUTES
          )
      },
      {
        path: 'leave-types',
        loadChildren: () =>
          import('./app/pages/leave-type/leave-type.routes').then(
            (m) => m.LEAVE_TYPE_ROUTES
          )
      },
      {
        path: 'ramadan-periods',
        loadChildren: () =>
          import('./app/pages/ramadan-period/ramadan-period.routes').then(
            (m) => m.RAMADAN_PERIOD_ROUTES
          )
      },
        {
        path: 'employeeDevicesAssignment',
        loadChildren: () =>
          import('./app/pages/EmployeeDevicesAssignment/employeeDevicesAssignment.routes').then(
            (m) => m.EMPLOYEE_DEVICES_ASSIGNMENT_ROUTES
          )
      },
      {
        path: 'teams',
        loadChildren: () =>
          import('./app/pages/teams/team.routes').then(
            (m) => m.TEAM_ROUTES
          )
      },
      {
        path: 'timetables',
        loadChildren: () =>
          import('./app/pages/timetable/timetable.routes').then(
            (m) => m.TIMETABLE_ROUTES
          )
      },
      {
        path: 'employees/reportingmanager',
        loadChildren: () =>
          import('./app/pages/employeeReportingManager/employeeReportingManager.routes').then(
            (m) => m.EMPLOYEEREPORTINGMANAGER_ROUTES
          )
      },
      {
        path: 'time-shifts',
        loadChildren: () =>
          import('./app/pages/timeShift/timeShift.routes').then(
            (m) => m.TIME_SHIFT_ROUTES
          )
      },
       {
        path: 'shifts',
        loadChildren: () =>
          import('./app/pages/shift/shift.routes').then(
            (m) => m.SHIFT_ROUTES
          )
      },
      { path: 'test', component: Layout },
      { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },
      {
        path: 'translations/:lang',
        component: TranslationManagerComponent
        // You might want to add a guard here as well, e.g., canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: 'landing',
    component: Landing,
    canActivate: [LoginGuard] // Prevent logged-in users from accessing landing
  },
  // {
  //   path: 'translations/:lang',
  //   component: TranslationManagerComponent
  // },
  { path: 'notfound', component: Notfound },
  {
    path: 'login',
    component: Login,
    canActivate: [LoginGuard] // Prevent logged-in users from accessing login
  },
  {
    path: 'forgetPassword',
    component: ForgetPassword
  },
  {
    path: 'resetPassword',
    component: ChangePassowrd
  },
  {
    path: 'auth',
    loadChildren: () => import('./app/pages/auth/auth.routes'),
    canActivate: [LoginGuard] // Protect auth routes
  },
  { path: '**', redirectTo: '/notfound' }
];
