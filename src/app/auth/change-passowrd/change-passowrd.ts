import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-change-passowrd',
 standalone: true,   // 👈 important for standalone
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule],  templateUrl: './change-passowrd.html',
  styleUrl: './change-passowrd.scss'
})
export class ChangePassowrd  implements OnInit {
  resetForm: FormGroup;
  token: string = '';
  email: string = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
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
    // ✅ read token & email from query params
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';
    });
  }

  passwordsMatch(group: FormGroup) {
    const newPass = group.get('newPassword')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.resetForm.invalid) return;

    this.isSubmitting = true;
    const { newPassword } = this.resetForm.value;

    this.authService.resetPassword(this.email, this.token, newPassword).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Password reset successful! You can now log in.');
        this.router.navigate(['/login']); // redirect after success
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        alert('Failed to reset password. Try again.');
      }
    });
  }
}