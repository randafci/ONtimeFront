import { Routes } from '@angular/router';
import { FamilyListComponent } from './family-list/family-list.component';

export const FAMILY_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: FamilyListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];