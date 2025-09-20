import { Routes } from '@angular/router';
import { SectionListComponent } from './section-list/section-list';

export const SECTION_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: SectionListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
