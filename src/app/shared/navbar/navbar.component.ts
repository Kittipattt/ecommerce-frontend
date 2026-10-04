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
    <header class="sticky top-0 z-50 bg-[#0b0f19]/85 backdrop-blur-md border-b border-gray-800 h-[72px] flex items-center">
      <div class="max-w-7xl w-full mx-auto px-6 flex items-center justify-between gap-5">
        <!-- Brand Logo -->
        <a routerLink="/" class="flex items-center gap-2.5 group">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <span class="font-heading text-xl font-extrabold text-white tracking-tight">Nexus<span class="text-indigo-400">Tech</span></span>
        </a>

        <!-- Navigation Links -->
        <nav class="flex items-center gap-3 sm:gap-6 text-sm font-medium">
          <a
            routerLink="/"
            routerLinkActive="text-white font-semibold after:scale-x-100"
            [routerLinkActiveOptions]="{exact: true}"
            class="text-gray-400 hover:text-white transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-indigo-500 after:scale-x-0 after:transition-transform">
            Storefront
          </a>
          @if (authService.isAuthenticated()) {
            <a
              routerLink="/my-orders"
              routerLinkActive="text-white font-semibold after:scale-x-100"
              class="text-gray-400 hover:text-white transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-indigo-500 after:scale-x-0 after:transition-transform">
              My Orders
            </a>
          }
          @if (authService.isAdmin()) {
            <a
              routerLink="/admin/dashboard"
              routerLinkActive="ring-2 ring-indigo-500/50 bg-indigo-500/25"
              class="inline-flex items-center gap-1.5 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold hover:bg-indigo-500/25 transition-all">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              Admin Portal
            </a>
          }
        </nav>

        <!-- Right Action Items -->
        <div class="flex items-center gap-3 sm:gap-4">
          <!-- Cart Button -->
          <button
            class="relative bg-gray-800/80 border border-gray-700 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-gray-200 hover:text-indigo-300 w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer"
            (click)="cartService.toggleCart()"
            aria-label="Open Shopping Cart">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            @if (cartService.itemCount() > 0) {
              <span class="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0b0f19] shadow">
                {{ cartService.itemCount() }}
              </span>
            }
          </button>

          <!-- User Menu -->
          @if (authService.isAuthenticated()) {
            <div class="flex items-center gap-2.5 sm:gap-3">
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center font-bold text-sm text-white border border-gray-600 shadow-sm">
                {{ authService.currentUser()?.fullName?.charAt(0) || 'U' }}
              </div>
              <div class="hidden md:flex flex-col text-left">
                <span class="text-xs font-semibold text-gray-200 leading-tight">{{ authService.currentUser()?.fullName }}</span>
                <span class="text-[10px] text-gray-400">{{ authService.isAdmin() ? 'Administrator' : 'Customer' }}</span>
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
  `
})
export class NavbarComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);
}
