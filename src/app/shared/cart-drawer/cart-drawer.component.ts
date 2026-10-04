import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (cartService.isCartOpen()) {
      <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex justify-end" (click)="cartService.closeCart()">
        <div
          class="w-full max-w-md h-full bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
          (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="p-5 sm:p-6 border-b border-gray-800 flex items-center justify-between">
            <div class="flex items-center gap-2.5 font-heading font-bold text-lg text-white">
              <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              <span>Your Shopping Cart</span>
              <span class="badge badge-primary">{{ cartService.itemCount() }}</span>
            </div>
            <button
              class="text-gray-400 hover:text-white p-1.5 text-base rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              (click)="cartService.closeCart()"
              aria-label="Close Cart">✕</button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-5 sm:p-6">
            @if (cartService.items().length === 0) {
              <div class="flex flex-col items-center justify-center text-center h-full gap-3 text-gray-400">
                <div class="text-5xl">🛍️</div>
                <h3 class="text-lg font-bold text-gray-200">Your cart is empty</h3>
                <p class="text-sm text-gray-400 max-w-xs">Looks like you haven't added any gear to your order yet.</p>
                <button class="btn btn-secondary btn-sm mt-3" (click)="cartService.closeCart()">
                  Explore Products
                </button>
              </div>
            } @else {
              <div class="space-y-4">
                @for (item of cartService.items(); track item.product.id) {
                  <div class="flex gap-4 pb-4 border-b border-gray-800/80 items-center">
                    <img [src]="item.product.imageUrl" [alt]="item.product.name" class="w-16 h-16 rounded-xl object-cover bg-gray-800 border border-gray-700/60 shrink-0" />
                    <div class="flex-1 min-w-0">
                      <span class="font-semibold text-sm text-gray-200 truncate block">{{ item.product.name }}</span>
                      <span class="text-cyan-400 font-bold text-sm block mt-0.5">\${{ item.product.price | number:'1.2-2' }}</span>
                      <div class="flex items-center gap-2 mt-2">
                        <button
                          class="w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                          (click)="cartService.updateQuantity(item.product.id, item.quantity - 1)">-</button>
                        <span class="text-xs font-bold text-gray-200 px-1">{{ item.quantity }}</span>
                        <button
                          class="w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                          (click)="cartService.updateQuantity(item.product.id, item.quantity + 1)">+</button>
                        <button
                          class="text-xs text-red-400 hover:text-red-300 ml-auto transition-colors cursor-pointer"
                          (click)="cartService.removeFromCart(item.product.id)">Remove</button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Footer -->
          @if (cartService.items().length > 0) {
            <div class="p-5 sm:p-6 border-t border-gray-800 bg-gray-900/95 space-y-3">
              <div class="flex justify-between items-center text-sm font-semibold text-gray-200">
                <span>Subtotal</span>
                <span class="font-mono text-base text-cyan-400">\${{ cartService.totalAmount() | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between items-center text-xs text-gray-400">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <button
                class="btn btn-primary btn-block py-3.5 mt-2 font-heading tracking-wide text-base shadow-lg shadow-indigo-500/25"
                (click)="goToCheckout()">
                Proceed to Checkout • \${{ cartService.totalAmount() | number:'1.2-2' }}
              </button>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class CartDrawerComponent {
  cartService = inject(CartService);
  router = inject(Router);

  goToCheckout() {
    this.cartService.closeCart();
    this.router.navigate(['/checkout']);
  }
}
