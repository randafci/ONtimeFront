import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
    providedIn: "root"
})
export class RedirectServices {
    constructor(private router: Router) {}

    redirectToNotFound() {
        this.router.navigate(["/not-found"]);
    }

    redirectToError500() {
        this.router.navigate(["/error"]);
    }

    redirectToUnAuthorized() {
        this.router.navigate(["/access"]);
    }

    redirectToTrialExpired() {
        this.router.navigate(["/trial-expired"]);
    }

    redirectToLogin() {
        this.router.navigate(["/login"]);
    }
    redirectToHome() {
        this.router.navigate(["/"]);
    }
}
