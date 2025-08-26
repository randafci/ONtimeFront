import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../auth.service";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    // Check if user is logged in
    if (this.authService.isLoggedIn()) {
      return true;
    }else{
      return true;
    }

    // Check for excluded routes
    const excludeRoutes = ["/epass/update"];
    if (excludeRoutes.some(excluded => state.url.includes(excluded))) {
      return true;
    }

    // Redirect to login with return URL
    return this.router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }
}