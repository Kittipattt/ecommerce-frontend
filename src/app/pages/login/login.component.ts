import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <!-- Tab selector -->
        <div class="auth-tabs">
          <button
            class="tab-btn"
            [class.active]="isLoginMode()"
            (click)="isLoginMode.set(true)">
            Sign In
          </button>
          <button
            class="tab-btn"
            [class.active]="!isLoginMode()"
            (click)="isLoginMode.set(false)">
            Create Account
          </button>
        </div>

        @if (isLoginMode()) {
          <!-- Quick Demo Buttons (Enterprise convenience for testing) -->
          <div class="quick-demo-box">
            <span class="demo-title">⚡ 1-Click Quick Demo Login</span>
            <div class="demo-actions">
              <button class="btn btn-secondary btn-sm" (click)="quickLogin('admin@store.com', 'admin123')">
                👑 Admin Demo
              </button>
              <button class="btn btn-secondary btn-sm" (click)="quickLogin('customer@store.com', 'customer123')">
                👤 Customer Demo
              </button>
            </div>
          </div>

          <!-- Sign In Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input
                type="email"
                formControlName="email"
                class="form-control"
                placeholder="name@example.com"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <input
                type="password"
                formControlName="password"
                class="form-control"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-block"
              [disabled]="isLoading() || loginForm.invalid">
              {{ isLoading() ? 'Signing in...' : 'Sign In to Account' }}
            </button>
          </form>
        } @else {
          <!-- Register Form -->
          <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="auth-form">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input
                type="text"
                formControlName="fullName"
                class="form-control"
                placeholder="John Doe"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input
                type="email"
                formControlName="email"
                class="form-control"
                placeholder="name@example.com"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Password (Min. 6 characters)</label>
              <input
                type="password"
                formControlName="password"
                class="form-control"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-block"
              [disabled]="isLoading() || registerForm.invalid">
              {{ isLoading() ? 'Creating account...' : 'Create Free Account' }}
            </button>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 180px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
    }
    .auth-card {
      max-width: 440px;
      width: 100%;
      padding: 32px;
    }
    .auth-tabs {
      display: flex;
      background: var(--bg-surface-elevated);
      border-radius: var(--radius-md);
      padding: 4px;
      margin-bottom: 24px;
      border: 1px solid var(--border);
    }
    .tab-btn {
      flex: 1;
      padding: 10px;
      border: none;
      background: none;
      color: var(--text-secondary);
      font-family: var(--font-heading);
      font-weight: 600;
      font-size: 0.95rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .tab-btn.active {
      background: var(--bg-surface);
      color: var(--text-main);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    .quick-demo-box {
      background: rgba(79, 70, 229, 0.1);
      border: 1px dashed rgba(79, 70, 229, 0.4);
      border-radius: var(--radius-md);
      padding: 14px;
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .demo-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: #a5b4fc;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .demo-actions {
      display: flex;
      gap: 10px;
    }
    .demo-actions button {
      flex: 1;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .btn-block {
      width: 100%;
      padding: 12px;
      margin-top: 8px;
    }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  router = inject(Router);

  isLoginMode = signal<boolean>(true);
  isLoading = signal<boolean>(false);

  loginForm: FormGroup = this.fb.group({
    email: ['customer@store.com', [Validators.required, Validators.email]],
    password: ['customer123', [Validators.required]]
  });

  registerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  quickLogin(email: string, pass: string) {
    this.loginForm.patchValue({ email, password: pass });
    this.onLogin();
  }

  onLogin() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.data.role === 'ROLE_ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  onRegister() {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
