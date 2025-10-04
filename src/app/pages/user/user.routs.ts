import { Routes } from '@angular/router';
import { UserList } from './user-list/user-list';
import { AddOrEditUser } from './add-or-edit-user/add-or-edit-user';
import { UserRolesComponent } from './user-roles/user-roles.component';


export const USER_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: UserList },
            { path: 'add', component: AddOrEditUser },
            { path: 'edit/:id', component: AddOrEditUser },
            { path: ':id/roles', component: UserRolesComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
