import { Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { AuthService } from "../auth.service";

@Injectable({
    providedIn: "root"
})
export class LoginGuard implements CanActivate {
    constructor(
        private router: Router,
        private authService: AuthService
    ) {}

    canActivate(): boolean | UrlTree {
        if (this.authService.isLoggedIn()) {
            // If already logged in, redirect to home
            return this.router.createUrlTree(['/']);
        }
        return true;
    }
}