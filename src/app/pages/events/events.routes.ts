import { Routes } from '@angular/router';
import { EventsListComponent } from './events-list/events-list';

export const EVENTS_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: EventsListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
