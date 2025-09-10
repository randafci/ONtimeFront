import { Routes } from '@angular/router';
import { EventsListComponent } from './events-list/events-list';
import { AddOrEditEvents } from './add-or-edit-events/add-or-edit-events';

export const EVENTS_ROUTES: Routes = [
    { 
        path: '',
        children: [
            { path: 'list', component: EventsListComponent },
            { path: 'add', component: AddOrEditEvents },
            { path: 'edit/:id', component: AddOrEditEvents },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
