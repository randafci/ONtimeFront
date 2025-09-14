
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
import { environment } from 'environments/environment';
import { User } from '../user.model';
import { ReactiveFormsModule } from '@angular/forms';   
import { AppConfigService } from '@/pages/service/app-config.service';
import { LayoutService } from '@/service/layout.service';


@Component({
  selector: 'app-login',
  imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator,ReactiveFormsModule],
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
    private messageService: MessageService,
   private appConfig: AppConfigService,
   private layoutService:LayoutService


  ) { 
      this.userForm = new FormGroup({
      username: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
      rememberMe: new FormControl(false)
      

    });

  }

 onSubmit() {
  if (this.userForm.invalid) {
    this.errorMessage = 'Please enter both email and password';
    return;
  }

  this.loading = true;
  this.errorMessage = null;

  this.authService.accountLogin(this.userForm.value).subscribe({
    next: (response: any) => {
      const token = response?.data?.accessToken;
      const refreshToken = response?.data?.refreshToken;
      const expiresAt = response?.data?.expiresAt;

      if (!token) {
        this.isAuthFailed = true;
        this.doAction();
        return;
      }
      localStorage.setItem('token', token);

      const tokenInfo = this.authService.decodeToken(token);
      this.authService.setTokenAndClaims(token, refreshToken, expiresAt);
     this.layoutService.initFromApi(2); // 👈 load settings for org


      this.authService.getAuthUserInfo().subscribe({
        next: (info: any) => {
          const user = new User(
            info?.name ?? "",
            token,
            expiresAt,
            refreshToken,
            info?.referenceId ?? 0,
            info?.userReferenceType ?? 0,
            info?.language ?? environment.defaultLanguage,
            info?.permissions
          );

          localStorage.setItem("token", token);
          localStorage.setItem("authData", JSON.stringify(user));
          localStorage.setItem("lan", environment.defaultLanguage);

          this.authService.loadPermissions();
          this.doAction();

          if (info?.permissions?.includes("SYSTEM_PERMISSION_CODE.Dashboard_PAGE")) {
            this.router.navigate(["/dashboard"]);
          } else {
            this.router.navigate([""]);
          }
        },
        error: () => {
          this.doAction();
          this.isAuthFailed = true;
        }
      });
    },
    error: () => {
      this.doAction();
      this.isAuthFailed = true;
    }
  });
}

    doAction() {
    this.loading = false;
    this.disableSubmit = false;
  }
  goToForgotPassword() {
  this.router.navigate(['/forgetPassword']);
}

}
