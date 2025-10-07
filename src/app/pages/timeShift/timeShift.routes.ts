import { Routes } from '@angular/router';
import { AddOrEditTimeShiftforTest } from './add-or-edit-time-shift/add-or-edit-time-shift';
import { UserSchedule } from './user-schedule/user-schedule';
import { TimeShiftList } from './time-shift-list/time-shift-list';

export const TIME_SHIFT_ROUTES: Routes = [
    { 
        path: '',
        children: [
              { path: 'list', component: TimeShiftList },
              { path: 'myShift', component: UserSchedule },

              { path: 'add', component: AddOrEditTimeShiftforTest },
              { path: 'edit/:id', component: AddOrEditTimeShiftforTest },
              { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];
