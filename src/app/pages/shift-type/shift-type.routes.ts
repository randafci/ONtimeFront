import { Routes } from '@angular/router';
import { ShiftTypeListComponent } from './shift-type-list/shift-type-list.component';
import { AddOrEditShiftTypeComponent } from './add-or-edit-shift-type/add-or-edit-shift-type.component';
export const SHIFT_TYPE_ROUTES: Routes = [
    {
        path: '',
        children: [
            { path: 'list', component: ShiftTypeListComponent },
            { path: 'add', component: AddOrEditShiftTypeComponent },
            { path: 'edit/:id', component: AddOrEditShiftTypeComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];