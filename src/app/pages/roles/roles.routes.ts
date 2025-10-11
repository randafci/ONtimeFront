import { Routes } from '@angular/router';
import { RolesListComponent } from './roles-list/roles-list.component';
import { AddEditRoleComponent } from './add-role/add-edit-role.component';
import { RoleUsersComponent } from './role-users/role-users.component';

export const ROLES_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: RolesListComponent },
            { path: 'add', component: AddEditRoleComponent },
            { path: 'edit/:id', component: AddEditRoleComponent },
            { path: ':id/users', component: RoleUsersComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
