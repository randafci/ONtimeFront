import { Routes } from '@angular/router';
import { GradeListComponent } from './grade-list/grade-list.component';

export const GRADE_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: GradeListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];