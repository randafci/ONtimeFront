import { AppFloatingConfigurator } from '@/layout/component/app.floatingconfigurator';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../auth.service';
import { environment } from '@/environments/environment';
import { User } from '../user.model';

@Component({
  selector: 'app-login',
  imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  providers: [MessageService]

})
export class Login {
  email: string = '';
  password: string = '';
  checked: boolean = false;
  rememberMe: boolean = false;

  loading: boolean = false;
  errorMessage: string | null = null;


  public userForm: FormGroup;
  public disableSubmit: boolean = false;
  public isAuthFailed: boolean = false;


  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) { 
      this.userForm = new FormGroup({
      username: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
    });
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.loading = true;
    this.errorMessage = null;

      this.authService.accountLogin(this.userForm.value).subscribe({
      next: (response: any) => {
        if (response.code === "88888") {
          this.isAuthFailed = true;
          this.doAction();
          return;
        }
        if (response.code === "99999") {
          this.isAuthFailed = true;
          this.doAction();
          return;
        }
        if (!response.token) {
          this.isAuthFailed = true;
          this.doAction();
          return;
        }

        var tokenInfo = this.authService.decodeToken(response.token);
        this.authService
          .getAuthUserInfo({ userId: tokenInfo.UserId })
          .subscribe({
            next: (info: any) => {
              const user = new User(
                info?.name ?? "",
                response?.token ?? "",
                response?.expireIn,
                response?.refreshToken,
                info?.referenceId ?? 0,
                info?.userReferenceType ?? 0,
                info?.language ?? environment.defaultLanguage,
                info?.permissions
              );
              localStorage.setItem("token", response?.token);
              localStorage.setItem("authData", JSON.stringify(user));
              localStorage.setItem("lan", environment.defaultLanguage);
              localStorage.setItem("isHost", response.isHost);
              localStorage.setItem("isSuperAdmin", response.isSuperAdmin);

              this.authService.loadPermissions();
              this.doAction();
              if (info?.permissions?.includes("SYSTEM_PERMISSION_CODE.Dashboard_PAGE")) {
                this.router.navigate(["/dashboard"]);
              } else {
                this.router.navigate([""]); // Replace with your desired route
              }
            },
            error: (error: any) => {
              this.doAction();
              this.isAuthFailed = true;
            },
          });
      },
      error: (err) => {
        this.doAction();
        this.isAuthFailed = true;
      },
    });
  }
    doAction() {
    this.loading = false;
    this.disableSubmit = false;
  }
}
