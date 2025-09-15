import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AppFloatingConfigurator } from "@/layout/component/app.floatingconfigurator";

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
    AppFloatingConfigurator
],
  templateUrl: './change-passowrd.html', styleUrl: './change-passowrd.scss',

  providers: [MessageService]
})
export class ChangePassowrd implements OnInit {
  resetForm: FormGroup;
   token: string | null = null;
  email: string | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.resetForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordsMatch }
    );
  }

  ngOnInit(): void {
    // Read token & email from query params with proper decoding
    this.token = this.route.snapshot.queryParamMap.get('token');
    this.email = this.route.snapshot.queryParamMap.get('email');
    console.log('Extracted Token:', this.token);
    console.log('Extracted Email:', this.email);

    if (!this.token) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid or expired token.' });
      setTimeout(() => this.router.navigate(['/login']), 3000);
    }
  }

  passwordsMatch(group: FormGroup) {
    const newPass = group.get('newPassword')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  }

  onSubmit() {
        if (this.resetForm.invalid || !this.token || !this.email) return;


    this.isSubmitting = true;
    const { newPassword } = this.resetForm.value;

    // Log what we're sending to the API for debugging
    console.log('Sending to API:', {
      email: this.email,
      token: this.token,
      hasPassword: !!newPassword
    });

    this.authService.resetPassword(this.email, this.token, newPassword).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Password reset successful! You can now log in.'
        });
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Reset password error:', err);
        
        let errorMessage = 'Failed to reset password. Please try again.';
        if (err.status === 400) {
          errorMessage = 'Invalid or expired reset token. Please request a new reset link.';
        } else if (err.status === 404) {
          errorMessage = 'User not found. Please check your email address.';
        } else if (err.status === 410) {
          errorMessage = 'This reset link has already been used or has expired.';
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      }
    });
  }
}