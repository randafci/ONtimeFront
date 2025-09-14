import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login';
import { Error } from './error';
import { ForgetPassword } from '@/auth/forget-password/forget-password';
import { ChangePassowrd } from '@/auth/change-passowrd/change-passowrd';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: Login },
   

] as Routes;
