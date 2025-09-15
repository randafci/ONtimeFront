import { MessageService } from 'primeng/api';
import { AppFloatingConfigurator } from '@/layout/component/app.floatingconfigurator';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forget-password',
  imports: [ ButtonModule,
    InputTextModule,
    RouterModule,
    RippleModule,
    AppFloatingConfigurator,
    ReactiveFormsModule],
  templateUrl: './forget-password.html',
  styleUrl: './forget-password.scss',
    providers: [MessageService]

})
export class ForgetPassword {
public forgotForm: FormGroup;
  public loading = false;
  public errorMessage: string | null = null;
  public successMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.forgotForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email])
    });
  }

  onSubmit() {
    if (this.forgotForm.invalid) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const email = this.forgotForm.value.email;

    // 🔹 Call backend to send reset link
  this.authService.forgotPassword(email).subscribe({
  next: (res) => {
    console.log("Forgot password response:", res);
    if (res.succeeded) {
      alert("Reset link sent successfully!");
    } else {
      alert("Something went wrong: " + res.message);
    }
  },
  error: (err) => {
    console.error(err);
    alert("Error: " + err.message);
  },
});

  }
}