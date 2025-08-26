import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateChild, UrlTree } from "@angular/router";
import { AuthService } from "../auth.service";
import { RedirectServices } from "@/shared/redirect-services";
import { Authorizations } from "../authorizations";


@Injectable({
    providedIn: "root"
})
export class ViewGuard implements CanActivateChild {
    constructor(
        private authService: AuthService,
        private redirectServices: RedirectServices
    ) {}

   async canActivateChild(childRoute: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
  const authorizations: string[] = childRoute.data["authorizations"] ?? [];
  const anyAuth: boolean = childRoute.data["anyAuthorization"] ?? false;

  if (this.authService.isAuthorized(authorizations, anyAuth)) {
    return true;
  }

  this.redirectServices.redirectToUnAuthorized();
  return false;
}

}
