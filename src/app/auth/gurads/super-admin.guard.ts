import { Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { AuthService } from "../auth.service";

@Injectable({
  providedIn: "root"
})
export class SuperAdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    const claims = this.authService.getClaims();
    const isSuperAdmin = claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
    
    if (isSuperAdmin) {
      return true;
    }
    
    return this.router.createUrlTree(['/notfound']);
  }
}
