import { Routes } from '@angular/router';
import { TeamList } from './team-list/team-list';
import { AddOrEditTeam } from './add-or-edit-team/add-or-edit-team';


export const TEAM_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: TeamList },
            { path: 'add', component: AddOrEditTeam },
            { path: 'edit/:id', component: AddOrEditTeam },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
