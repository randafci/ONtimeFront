import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { MenuComponent } from '@/main/menu/menu';
import { Layout } from '@/main/layout/layout';
import { Login } from '@/auth/login/login';
import { AuthGuard } from '@/auth/gurads/auth.guard';
import { LoginGuard } from '@/auth/gurads/login.guard';


export const appRoutes: Routes = [
    {
        path: '',
        component: Layout, //AppLayout,
        canActivate: [AuthGuard], // Protect entire layout
        children: [
            { path: '', component: Dashboard },
            { 
                path: 'uikit', 
                loadChildren: () => import('./app/pages/uikit/uikit.routes') 
            },
            { 
                path: 'organizations', 
                loadChildren: () => import('./app/pages/organization/oraganization.routes')
                    .then(m => m.ORGANIZATION_ROUTES)
            },
            { path: 'documentation', component: Documentation },
            { path: 'test', component: Layout },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { 
        path: 'landing', 
        component: Landing,
        canActivate: [LoginGuard] // Prevent logged-in users from accessing
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