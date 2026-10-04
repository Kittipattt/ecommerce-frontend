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
    <div class="min-h-[calc(100vh-240px)] flex items-center justify-center px-4 py-12">
      <div class="max-w-md w-full p-8 rounded-2xl bg-gray-900/90 border border-gray-800 shadow-2xl backdrop-blur-md">
        <!-- Tab selector -->
        <div class="flex bg-gray-800/80 p-1.5 rounded-xl mb-6 border border-gray-700/50">
          <button
            class="flex-1 py-2.5 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer"
            [ngClass]="isLoginMode() ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-white'"
            (click)="isLoginMode.set(true)">
            Sign In
          </button>
          <button
            class="flex-1 py-2.5 rounded-lg font-heading font-semibold text-sm transition-all cursor-pointer"
            [ngClass]="!isLoginMode() ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-white'"
            (click)="isLoginMode.set(false)">
            Create Account
          </button>
        </div>

        @if (isLoginMode()) {
          <!-- Quick Demo Buttons -->
          <div class="bg-indigo-950/30 border border-dashed border-indigo-500/40 rounded-xl p-4 mb-6 space-y-2.5">
            <span class="text-xs font-bold text-indigo-300 uppercase tracking-wider block">⚡ 1-Click Quick Demo Login</span>
            <div class="grid grid-cols-2 gap-2">
              <button class="btn btn-secondary btn-sm" (click)="quickLogin('admin@store.com', 'admin123')">
                👑 Admin Demo
              </button>
              <button class="btn btn-secondary btn-sm" (click)="quickLogin('customer@store.com', 'customer123')">
                👤 Customer Demo
              </button>
            </div>
          </div>

          <!-- Sign In Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                formControlName="email"
                class="form-control"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                formControlName="password"
                class="form-control"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-block py-3 mt-4 text-sm font-semibold tracking-wide shadow-lg shadow-indigo-500/25"
              [disabled]="isLoading() || loginForm.invalid">
              {{ isLoading() ? 'Signing in...' : 'Sign In to Account' }}
            </button>
          </form>
        } @else {
          <!-- Register Form -->
          <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                formControlName="fullName"
                class="form-control"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                formControlName="email"
                class="form-control"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Password (Min. 6 characters)</label>
              <input
                type="password"
                formControlName="password"
                class="form-control"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-block py-3 mt-4 text-sm font-semibold tracking-wide shadow-lg shadow-indigo-500/25"
              [disabled]="isLoading() || registerForm.invalid">
              {{ isLoading() ? 'Creating account...' : 'Create Free Account' }}
            </button>
          </form>
        }
      </div>
    </div>
  `
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
