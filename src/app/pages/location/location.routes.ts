import { Routes } from '@angular/router';
import { LocationListComponent } from './location-list/location-list.component';

export const LOCATION_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: LocationListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
