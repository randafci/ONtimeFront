import { Routes } from '@angular/router';
import { AttendanceListComponent } from './attendance-list/attendance-list';
import { AuthGuard } from '../../auth/gurads/auth.guard';

export const ATTENDANCE_ROUTES: Routes = [
  {
    path: '',
    component: AttendanceListComponent,
    canActivate: [AuthGuard]
  }
];
