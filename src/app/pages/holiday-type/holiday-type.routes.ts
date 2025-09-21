import { Routes } from '@angular/router';
import { HolidayTypeListComponent } from './holiday-type-list/holiday-type-list';

export const HOLIDAY_TYPE_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: HolidayTypeListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
