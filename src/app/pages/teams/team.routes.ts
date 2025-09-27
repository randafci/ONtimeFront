import { Routes } from '@angular/router';
import { TeamListComponent } from './team-list/team-list';

export const TEAM_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: TeamListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
