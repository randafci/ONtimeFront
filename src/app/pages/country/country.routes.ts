import { Routes } from '@angular/router';
import { CountryListComponent } from './country-list/country-list';
import { AddOrEditCountry } from './add-or-edit-country/add-or-edit-country';

export const COUNTRY_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: CountryListComponent },
            { path: 'add', component: AddOrEditCountry },
            { path: 'edit/:id', component: AddOrEditCountry },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
