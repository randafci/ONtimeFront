// organization.routes.ts
import { Routes } from '@angular/router';
import { EditPermission } from './edit-permission/edit-permission';


export const PERMITION_ROUTES: Routes = [
    { 
        path: '',
        children: [
           // { path: 'list', component:  },
           // { path: 'add', component:  },
            { path: 'edit/:id', component: EditPermission },
            //{ path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];