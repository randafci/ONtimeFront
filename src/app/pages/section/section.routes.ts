import { Routes } from '@angular/router';
import { SectionListComponent } from './section-list/section-list';
import { AddOrEditSection } from './add-or-edit-section/add-or-edit-section';

export const SECTION_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: SectionListComponent },
            { path: 'add', component: AddOrEditSection },
            { path: 'edit/:id', component: AddOrEditSection },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
