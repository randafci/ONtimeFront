import { Routes } from '@angular/router';
import { FamilyListComponent } from './family-list/family-list.component';
import { AddOrEditFamilyComponent } from './add-or-edit-family/add-or-edit-family.component';

export const FAMILY_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: FamilyListComponent },
            { path: 'add', component: AddOrEditFamilyComponent },
            { path: 'edit/:id', component: AddOrEditFamilyComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];