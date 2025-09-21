import { Routes } from '@angular/router';
import { HolidayListComponent } from './holiday-list/holiday-list';

export const HOLIDAY_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: HolidayListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
