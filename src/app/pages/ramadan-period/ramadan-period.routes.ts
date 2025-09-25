import { Routes } from '@angular/router';
import { RamadanPeriodListComponent } from './ramadan-period-list/ramadan-period-list';

export const RAMADAN_PERIOD_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: RamadanPeriodListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
