import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <div class="navbar-container">
        <!-- Brand Logo -->
        <a routerLink="/" class="brand">
          <div class="brand-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <span class="brand-name">Nexus<span class="text-primary">Tech</span></span>
        </a>

        <!-- Navigation Links -->
        <nav class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">Storefront</a>
          @if (authService.isAuthenticated()) {
            <a routerLink="/my-orders" routerLinkActive="active" class="nav-item">My Orders</a>
          }
          @if (authService.isAdmin()) {
            <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item nav-admin-badge">
              <span class="admin-dot"></span> Admin Portal
            </a>
          }
        </nav>

        <!-- Right Action Items -->
        <div class="nav-actions">
          <!-- Cart Button -->
          <button class="cart-btn" (click)="cartService.toggleCart()" aria-label="Open Shopping Cart">
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            @if (cartService.itemCount() > 0) {
              <span class="cart-badge">{{ cartService.itemCount() }}</span>
            }
          </button>

          <!-- User Menu -->
          @if (authService.isAuthenticated()) {
            <div class="user-profile">
              <div class="user-avatar">
                {{ authService.currentUser()?.fullName?.charAt(0) || 'U' }}
              </div>
              <div class="user-info">
                <span class="user-name">{{ authService.currentUser()?.fullName }}</span>
                <span class="user-role">{{ authService.isAdmin() ? 'Administrator' : 'Customer' }}</span>
              </div>
              <button class="btn btn-secondary btn-sm" (click)="authService.logout()">
                Logout
              </button>
            </div>
          } @else {
            <a routerLink="/login" class="btn btn-primary btn-sm">
              Sign In
            </a>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(11, 15, 25, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      height: 72px;
      display: flex;
      align-items: center;
    }
    .navbar-container {
      max-width: 1280px;
      width: 100%;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }
    .brand-icon {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-sm);
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px var(--primary-glow);
    }
    .brand-name {
      font-family: var(--font-heading);
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .text-primary {
      color: #818cf8;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .nav-item {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-secondary);
      transition: color var(--transition-fast);
      padding: 6px 0;
      position: relative;
    }
    .nav-item:hover, .nav-item.active {
      color: var(--text-main);
    }
    .nav-item.active::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--primary);
      border-radius: 2px;
    }
    .nav-admin-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(79, 70, 229, 0.15);
      color: #a5b4fc;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      border: 1px solid rgba(79, 70, 229, 0.3);
    }
    .admin-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #818cf8;
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .cart-btn {
      position: relative;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border);
      color: var(--text-main);
      width: 42px;
      height: 42px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .cart-btn:hover {
      border-color: var(--primary);
      background: rgba(79, 70, 229, 0.1);
      color: #a5b4fc;
    }
    .cart-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background: linear-gradient(135deg, var(--danger) 0%, #dc2626 100%);
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 700;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--bg-main);
    }
    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      color: var(--text-main);
      border: 1px solid var(--border);
    }
    .user-info {
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-main);
      line-height: 1.2;
    }
    .user-role {
      font-size: 0.7rem;
      color: var(--text-secondary);
    }
    @media (max-width: 768px) {
      .user-info {
        display: none;
      }
      .nav-links {
        gap: 12px;
      }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);
}
