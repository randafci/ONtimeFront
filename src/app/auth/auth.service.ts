import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { jwtDecode } from "jwt-decode";
import { BehaviorSubject, catchError, Observable, tap, throwError } from "rxjs";
//import { AccountClient, UserRefreshToken } from "src/app/web-api-client";
//import { LoginLogoutTabService } from "../shared/custom/services/login-logout-tab/login-logout-tab.service";
//import { SignalRService } from "../shared/custom/services/signalR/signalR.service";
//import { SharedSettings } from "../shared/custom/shared.settings";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AppConfigService } from "../pages/service/app-config.service";
import { User } from "./user.model";
import { AdminLoginCommand, CreateSignupCommand } from "../interfaces/userLoginCommand.interface";
// import { environment } from "../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private authorizations: string[] = [];
  //public user = new BehaviorSubject<User>(null);
  private permissions: string[] = [];
private claims: any = null;

  public apiUrl: string;
  constructor(   private router: Router,private http: HttpClient, private appConfig: AppConfigService) {
    this.apiUrl = this.appConfig.apiUrl ;
        this.loadPermissions();

  }
  isLoggedIn() {
    const authDataFromStorage = this.getUserDataFromLocalStorage();
    if (authDataFromStorage && authDataFromStorage.token) {
      return true;
    }
    return false;
  }

  isAuthorizred(authorizations: string[], anyAuthorization?: boolean) {
    return anyAuthorization ?? false
      ? authorizations.some((auth) => this.authorizations.includes(auth))
      : authorizations.every((auth) => this.authorizations.includes(auth));
  }

  getUserId(): string | null {
    const userDataFromStorage = this.getUserDataFromLocalStorage();
    if (!(userDataFromStorage && userDataFromStorage.token)) {
      return null;
    }
    return this.decodeToken(userDataFromStorage.token)["clientKey"];
  }

  getEmployeeId(): number | null {
    const userDataFromStorage = this.getUserDataFromLocalStorage();
    if (!(userDataFromStorage && userDataFromStorage.token)) {
      return null;
    }
    return this.getUserDataFromLocalStorage()?.referenceType == 1
      ? this.getUserDataFromLocalStorage()?.referenceId
      : null;
  }

  /*  accountLogin(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/Account/Login`, data);
  } */
  accountLogin(data: any): Observable<any> {
    console.log(" this.apiUrl" , this.apiUrl)
    return this.http
      .post(`${this.apiUrl}/api/Account/Login`, data)
      .pipe(
        tap((response: any) => {
          if (response.token) {
            const authData = {
              _token: response.token,
              isHost: response.isHost,
              departmentId: response.departmentId,
              employeeId: response.employeeId,
              // include other necessary properties from the response
              // or from your existing localStorage structure
              ...JSON.parse(localStorage.getItem("authData") ?? "{}"),
            };
            localStorage.setItem("authData", JSON.stringify(authData));
          }

          if (response.departmentId) {
            localStorage.setItem(
              "departmentId",
              response.departmentId.toString()
            );
          }
          if (response.employeeId) {
            localStorage.setItem("employeeId", response.employeeId.toString());
          }
        })
      );
  }

getAuthUserInfo(): Observable<any> {
  const token = localStorage.getItem('token'); // adjust the key you use
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.get<any>(
    `${this.apiUrl}/api/account/user-claims`,
    { headers }
  ).pipe(
    tap((response: any) => {
      // directly store the permissions list from response.data
      if (response && response.data) {
        localStorage.setItem("permissions", JSON.stringify(response.data));
      }
    })
  );
}




  getUserDataFromLocalStorage(): {
    expireIn: string;
    refreshToken: string;
    token: string;
    userName: string;
    referenceId: number;
    referenceType: number;
    permissions: string[];
    lan: string;
    isHost: boolean;
    isSuperAdmin: boolean;
    departmentId: number;
    employeeId: number;
  } {
    var item = JSON.parse(localStorage.getItem("authData") ?? "{}");
    return {
      expireIn: item?.expireIn ?? "",
      refreshToken: item?.refreshToken ?? "",
      token: item?._token ?? "",
      userName: item?.userName ?? "",
      referenceId: item?.referenceId ?? 0,
      referenceType: item?.referenceType ?? 0,
      permissions: item?.permissions ?? [],
      lan: item?.language ?? "",
      isHost: item?.isHost ?? false,
      isSuperAdmin: item?.isSuperAdmin ?? false,
      departmentId: item?.departmentId ?? 0,
      employeeId: item?.employeeId ?? 0,
    };
  }
  loadPermissions() {
    const userDataFromStorage = this.getUserDataFromLocalStorage();
    if (!(userDataFromStorage && userDataFromStorage.token)) {
      this.authorizations = [];
    }
    this.authorizations = userDataFromStorage?.permissions ?? [];
  }

  autoLogin() {
    const userData = this.getUserDataFromLocalStorage();
    if (!userData) {
      return;
    }
    const loadedUser = new User(
      userData.userName,
      userData.token,
      new Date(userData.expireIn),
      userData.refreshToken,
      userData.referenceId,
      userData.referenceType,
      userData.lan
    );
    if (loadedUser.token) {
      //this.user.next(loadedUser);
      this.loadPermissions();
    }
  }

  // async logout() {
  //     this.authorizations = [];
  //     localStorage.removeItem("authData");
  //     localStorage.removeItem("token");
  //     this.router.navigate(["/login"]);
  // }
  async logout() {
    try {
      await this.http.post<string>(
        `${this.apiUrl}/Account/logout`,
        {},
        { withCredentials: true }
      );
      console.log("logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    }

    this.authorizations = [];
    localStorage.removeItem("authData");
    localStorage.removeItem("token");
    localStorage.removeItem("lan");
    localStorage.removeItem("isHost");
    localStorage.removeItem("departmentId");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("isSuperAdmin");
    this.router.navigate(["/login"]);
  }

  generateRefreshToken(): any {
    const userData = this.getUserDataFromLocalStorage();
    /*
        return this.accountClient.refreshToken(
            new UserRefreshToken({
                refreshToken: userData.refreshToken,
                accessToken: userData.token
            })
        );
        */
    return "";
  }

  public decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  }

  loginAdmin(command: AdminLoginCommand): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/Account/Login`, command, {
      responseType: "text" as "json",
    });
  }
forgotPassword(Email: string): Observable<any> {
  return this.http
    .post<any>(`${this.apiUrl}/api/Account/forgot-password`, {
      email: Email,
    })
    .pipe(
      catchError((error) => {
        const errorMessage =
          "An error occurred while sending the reset link.";
        console.error(errorMessage, error);
        return throwError(() => new Error(errorMessage));
      })
    );
}

  resetPassword(
  Email: string,
  Token: string,
  NewPassword: string
): Observable<any> {
  const payload = { Email, Token, NewPassword };

  return this.http.post(
    `${this.apiUrl}/api/Account/reset-password`, // 👈 fixed URL
    payload,
    { responseType: 'text' as 'json' }
  ).pipe(
    catchError((error) => {
      console.error("An error occurred while resetting the password.", error);
      return throwError(() => new Error("An error occurred while resetting the password."));
    })
  );
}


  changePassword(
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/Account/change-password`, {
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
  }
 
  getCurrentEmployeeId(): number | null {
    const employeeId = localStorage.getItem("employeeId");
    return employeeId ? Number(employeeId) : null;
  }
  private getAuthHeaders(): { headers: Record<string, string> } {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  }
  accountSignUp(command: CreateSignupCommand): Observable<number> {
    var headers = this.getAuthHeaders();
    return this.http.post<number>(`${this.apiUrl}/Signup`, command );
  }



  setPermissions(permissions: string[]) {
    this.permissions = permissions;
    localStorage.setItem("permissions", JSON.stringify(permissions));
  }

  loadPermissionsFromStorage() {
    const stored = localStorage.getItem("permissions");
    this.permissions = stored ? JSON.parse(stored) : [];
  }

  hasPermission(required: string): boolean {
    return this.permissions.includes(required);
  }

  isAuthorized(requiredList: string[], any: boolean = false): boolean {
    if (!requiredList || requiredList.length === 0) return true;
    if (any) return requiredList.some(r => this.permissions.includes(r));
    return requiredList.every(r => this.permissions.includes(r));
  }

// Enhanced getHeaders method with better debugging
getHeaders(): HttpHeaders {
  try {
    const userData = this.getUserDataFromLocalStorage();
    const token = userData?.token;
    
    console.log('Token being used:', token ? 'Present' : 'Missing');
    
    if (token) {
      // Verify token format
      if (!token.startsWith('eyJ')) {
        console.error('Token format appears invalid');
      }
      
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
    }
  } catch (error) {
    console.error('Error getting auth headers:', error);
  }
  
  return new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });
}
getDecodedToken(): any {
  const userDataFromStorage = this.getUserDataFromLocalStorage();
  if (!userDataFromStorage?.token) {
    return null;
  }
  return this.decodeToken(userDataFromStorage.token);
}
getOrgId(): string | null {
  const decoded = this.getDecodedToken();
  return decoded ? decoded["OrgId"] ?? null : null;
}


setTokenAndClaims(token: string, refreshToken: string, expiresAt: string) {
  localStorage.setItem("token", token);

  const decoded = this.decodeToken(token);
  this.claims = decoded;

  const authData = {
    _token: token,
    refreshToken,
    expireIn: expiresAt,
    userName: decoded?.unique_name ?? "",
    email: decoded?.email ?? "",
    orgId: decoded?.OrgId ?? "",
    role: decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? "",
    ...JSON.parse(localStorage.getItem("authData") ?? "{}"),
  };

  localStorage.setItem("authData", JSON.stringify(authData));
}

getClaims(): any {
  if (!this.claims) {
    const userData = this.getUserDataFromLocalStorage();
    if (userData?.token) {
      this.claims = this.decodeToken(userData.token);
    }
  }
  return this.claims;
}


getRole(): string | null {
  return this.getClaims()?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? null;
}

  
}
