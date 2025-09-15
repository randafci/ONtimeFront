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
import { DeviceListComponent } from './app/pages/device/device-list/device-list.component';
import { AddEditDeviceComponent } from './app/pages/device/add-edit-device/add-edit-device.component';

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
        canActivate: [SuperAdminGuard]
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
      { path: 'test', component: Layout },
      { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
    ]
  },
  {
    path: 'landing',
    component: Landing,
    canActivate: [LoginGuard] // Prevent logged-in users from accessing landing
  },
  {
    path: 'translations/:lang',
    component: TranslationManagerComponent
  },
  { path: 'notfound', component: Notfound },
  {
    path: 'login',
    component: Login,
    canActivate: [LoginGuard] // Prevent logged-in users from accessing login
  },
  {
    path: 'auth',
    loadChildren: () => import('./app/pages/auth/auth.routes'),
    canActivate: [LoginGuard] // Protect auth routes
  },
  { path: '**', redirectTo: '/notfound' }
];
