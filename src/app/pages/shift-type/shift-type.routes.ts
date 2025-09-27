import { Routes } from '@angular/router';
import { ShiftTypeListComponent } from './shift-type-list/shift-type-list.component';

export const SHIFT_TYPE_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: ShiftTypeListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];