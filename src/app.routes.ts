import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { MenuComponent } from '@/main/menu/menu';
import { Layout } from '@/main/layout/layout';

import { RolesListComponent } from '@/pages/roles/roles-list/roles-list.component';
import { AddRoleComponent } from '@/pages/roles/add-role/add-role.component';
import { TranslationManagerComponent } from '@/pages/translation-manager/translation-manager/translation-manager.component';

export const appRoutes: Routes = [
    {
        path: '',
        component: Layout,//AppLayout,
        children: [
            { path: '', component: Dashboard },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'organization', loadChildren: () => import('./app/pages/organization/oraganization.routes') },
            { path: 'roles', component: RolesListComponent },
            { path: 'roles/add', component: AddRoleComponent },

            { path: 'documentation', component: Documentation },
            { path: 'test', component: Layout },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'landing', component: Landing },
    // { path: 'translation', component: TranslationManagerComponent },
    {
    path: 'translations/:lang',
    component: TranslationManagerComponent
  },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
