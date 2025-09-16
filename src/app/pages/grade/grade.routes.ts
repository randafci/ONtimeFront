import { Routes } from '@angular/router';
import { GradeListComponent } from './grade-list/grade-list.component';
import { AddOrEditGradeComponent } from './add-or-edit-grade/add-or-edit-grade.component';

export const GRADE_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: GradeListComponent },
            { path: 'add', component: AddOrEditGradeComponent },
            { path: 'edit/:id', component: AddOrEditGradeComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];