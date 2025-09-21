import { Routes } from '@angular/router';
import { CountryListComponent } from './country-list/country-list';

export const COUNTRY_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: CountryListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
