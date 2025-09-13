import { Routes } from '@angular/router';
import { LocationList } from './location-list/location-list';
import { AddOrEditLocation } from './add-or-edit-location/add-or-edit-location';


export const LOCATION_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: LocationList },
            { path: 'add', component: AddOrEditLocation },
            { path: 'edit/:id', component: AddOrEditLocation },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
