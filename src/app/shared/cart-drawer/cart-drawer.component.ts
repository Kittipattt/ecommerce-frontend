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
      <div class="cart-backdrop" (click)="cartService.closeCart()">
        <div class="cart-drawer" (click)="$event.stopPropagation()">
          <div class="cart-header">
            <div class="cart-title">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              <span>Your Shopping Cart</span>
              <span class="badge badge-primary">{{ cartService.itemCount() }}</span>
            </div>
            <button class="close-btn" (click)="cartService.closeCart()" aria-label="Close Cart">✕</button>
          </div>

          <div class="cart-body">
            @if (cartService.items().length === 0) {
              <div class="empty-cart">
                <div class="empty-icon">🛍️</div>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added any products yet.</p>
                <button class="btn btn-secondary btn-sm" (click)="cartService.closeCart()">
                  Explore Products
                </button>
              </div>
            } @else {
              <div class="cart-items">
                @for (item of cartService.items(); track item.product.id) {
                  <div class="cart-item">
                    <img [src]="item.product.imageUrl" [alt]="item.product.name" class="item-img" />
                    <div class="item-details">
                      <span class="item-name">{{ item.product.name }}</span>
                      <span class="item-price">\${{ item.product.price | number:'1.2-2' }}</span>
                      <div class="item-qty-actions">
                        <button class="qty-btn" (click)="cartService.updateQuantity(item.product.id, item.quantity - 1)">-</button>
                        <span class="qty-val">{{ item.quantity }}</span>
                        <button class="qty-btn" (click)="cartService.updateQuantity(item.product.id, item.quantity + 1)">+</button>
                        <button class="remove-btn" (click)="cartService.removeFromCart(item.product.id)">Remove</button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          @if (cartService.items().length > 0) {
            <div class="cart-footer">
              <div class="summary-row">
                <span>Subtotal</span>
                <span class="summary-val">\${{ cartService.totalAmount() | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row text-muted">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <button class="btn btn-primary btn-checkout" (click)="goToCheckout()">
                Proceed to Checkout • \${{ cartService.totalAmount() | number:'1.2-2' }}
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .cart-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(6px);
      z-index: 1000;
      display: flex;
      justify-content: flex-end;
      animation: fadeIn 0.2s ease-out;
    }
    .cart-drawer {
      width: 100%;
      max-width: 440px;
      height: 100%;
      background: var(--bg-surface);
      border-left: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
    }
    .cart-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .cart-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1.15rem;
    }
    .close-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 1.25rem;
      cursor: pointer;
      padding: 4px;
    }
    .close-btn:hover {
      color: var(--text-main);
    }
    .cart-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
    }
    .empty-cart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      height: 100%;
      gap: 12px;
    }
    .empty-icon {
      font-size: 3rem;
    }
    .empty-cart h3 {
      font-size: 1.2rem;
    }
    .empty-cart p {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 12px;
    }
    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .cart-item {
      display: flex;
      gap: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
    }
    .item-img {
      width: 72px;
      height: 72px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
    }
    .item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .item-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-main);
      line-height: 1.3;
    }
    .item-price {
      font-weight: 700;
      color: #818cf8;
      font-size: 0.95rem;
    }
    .item-qty-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
    }
    .qty-btn {
      width: 26px;
      height: 26px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--bg-surface-elevated);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .qty-btn:hover {
      background: #374151;
    }
    .qty-val {
      font-size: 0.875rem;
      font-weight: 600;
      min-width: 20px;
      text-align: center;
    }
    .remove-btn {
      margin-left: auto;
      background: none;
      border: none;
      color: var(--danger);
      font-size: 0.8rem;
      cursor: pointer;
    }
    .remove-btn:hover {
      text-decoration: underline;
    }
    .cart-footer {
      padding: 20px 24px;
      border-top: 1px solid var(--border);
      background: var(--bg-surface-elevated);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.95rem;
      font-weight: 500;
    }
    .summary-val {
      font-weight: 700;
      font-size: 1.15rem;
      color: var(--text-main);
    }
    .btn-checkout {
      width: 100%;
      padding: 14px;
      font-size: 1rem;
    }
    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  `]
})
export class CartDrawerComponent {
  cartService = inject(CartService);
  router = inject(Router);

  goToCheckout() {
    this.cartService.closeCart();
    this.router.navigate(['/checkout']);
  }
}
