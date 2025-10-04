import { Routes } from '@angular/router';
import { ShiftListComponent } from './shift-list/shift-list.component';

export const SHIFT_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: ShiftListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];