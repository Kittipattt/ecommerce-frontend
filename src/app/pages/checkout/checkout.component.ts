import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="checkout-page">
      @if (orderSuccess(); as order) {
        <!-- Order Success State -->
        <div class="card order-success-card">
          <div class="success-icon">🎉</div>
          <div class="badge badge-success">Order Confirmed</div>
          <h2 class="success-title">Thank You For Your Order!</h2>
          <p class="success-desc">
            Your payment was processed and your order has been received. Our fulfillment team is preparing your package.
          </p>

          <div class="order-summary-box">
            <div class="box-row">
              <span class="label">Order Number:</span>
              <span class="val text-primary font-mono">{{ order.orderNumber }}</span>
            </div>
            <div class="box-row">
              <span class="label">Recipient:</span>
              <span class="val">{{ order.shippingName }}</span>
            </div>
            <div class="box-row">
              <span class="label">Shipping Address:</span>
              <span class="val">{{ order.shippingAddress }}</span>
            </div>
            <div class="box-row">
              <span class="label">Total Paid:</span>
              <span class="val font-bold text-accent">\${{ order.totalAmount | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="success-actions">
            <a routerLink="/my-orders" class="btn btn-primary">
              View My Orders
            </a>
            <a routerLink="/" class="btn btn-secondary">
              Back to Store
            </a>
          </div>
        </div>
      } @else if (cartService.items().length === 0) {
        <!-- Empty Cart Redirect State -->
        <div class="card empty-checkout-card">
          <h2>Your cart is empty</h2>
          <p class="text-secondary">Please add items to your cart before proceeding to checkout.</p>
          <a routerLink="/" class="btn btn-primary">Explore Products</a>
        </div>
      } @else {
        <!-- Checkout Flow -->
        <div class="checkout-container">
          <div class="checkout-main">
            <h1 class="page-title">Secure Checkout</h1>
            <p class="page-subtitle">Please provide your delivery information and payment preference</p>

            <form [formGroup]="checkoutForm" (ngSubmit)="submitOrder()" class="checkout-form">
              <!-- Shipping Information -->
              <div class="form-section card">
                <h3 class="section-heading">1. Shipping Information</h3>

                <div class="form-group">
                  <label class="form-label">Full Name *</label>
                  <input
                    type="text"
                    formControlName="shippingName"
                    class="form-control"
                    placeholder="Recipient's name"
                  />
                  @if (checkoutForm.get('shippingName')?.touched && checkoutForm.get('shippingName')?.invalid) {
                    <span class="form-error">Recipient name is required</span>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    formControlName="phone"
                    class="form-control"
                    placeholder="e.g. 081-234-5678"
                  />
                  @if (checkoutForm.get('phone')?.touched && checkoutForm.get('phone')?.invalid) {
                    <span class="form-error">Valid contact phone number is required</span>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">Delivery Address *</label>
                  <textarea
                    rows="3"
                    formControlName="shippingAddress"
                    class="form-control"
                    placeholder="Street address, building, subdistrict, postal code"
                  ></textarea>
                  @if (checkoutForm.get('shippingAddress')?.touched && checkoutForm.get('shippingAddress')?.invalid) {
                    <span class="form-error">Shipping address is required</span>
                  }
                </div>
              </div>

              <!-- Payment Method -->
              <div class="form-section card">
                <h3 class="section-heading">2. Payment Method</h3>
                <div class="payment-options">
                  <label class="payment-card" [class.selected]="checkoutForm.get('paymentMethod')?.value === 'CREDIT_CARD'">
                    <input type="radio" value="CREDIT_CARD" formControlName="paymentMethod" />
                    <div class="payment-label">
                      <span class="p-title">Credit / Debit Card</span>
                      <span class="p-sub">Visa, Mastercard, JCB (Instant simulated auth)</span>
                    </div>
                  </label>

                  <label class="payment-card" [class.selected]="checkoutForm.get('paymentMethod')?.value === 'PROMPTPAY'">
                    <input type="radio" value="PROMPTPAY" formControlName="paymentMethod" />
                    <div class="payment-label">
                      <span class="p-title">PromptPay / Mobile Banking</span>
                      <span class="p-sub">Zero-fee instant transfer QR</span>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-primary btn-submit-order"
                [disabled]="isSubmitting() || checkoutForm.invalid">
                @if (isSubmitting()) {
                  <span>Processing Order...</span>
                } @else {
                  <span>Confirm & Pay \${{ cartService.totalAmount() | number:'1.2-2' }}</span>
                }
              </button>
            </form>
          </div>

          <!-- Order Summary Sidebar -->
          <div class="checkout-sidebar">
            <div class="card summary-card">
              <h3 class="summary-heading">Order Summary</h3>

              <div class="sidebar-items">
                @for (item of cartService.items(); track item.product.id) {
                  <div class="sidebar-item">
                    <img [src]="item.product.imageUrl" [alt]="item.product.name" class="sidebar-thumb" />
                    <div class="sidebar-item-info">
                      <span class="sidebar-name">{{ item.product.name }}</span>
                      <span class="sidebar-qty text-secondary">Qty: {{ item.quantity }}</span>
                    </div>
                    <span class="sidebar-item-price">\${{ (item.product.price * item.quantity) | number:'1.2-2' }}</span>
                  </div>
                }
              </div>

              <div class="sidebar-totals">
                <div class="tot-row">
                  <span>Subtotal</span>
                  <span>\${{ cartService.totalAmount() | number:'1.2-2' }}</span>
                </div>
                <div class="tot-row text-success">
                  <span>Express Delivery</span>
                  <span>FREE</span>
                </div>
                <div class="tot-row tot-grand">
                  <span>Grand Total</span>
                  <span class="text-primary">\${{ cartService.totalAmount() | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-page {
      max-width: 1180px;
      margin: 40px auto 80px auto;
      padding: 0 24px;
      width: 100%;
    }
    .checkout-container {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 32px;
      align-items: flex-start;
    }
    .page-title {
      font-size: 2rem;
      margin-bottom: 6px;
    }
    .page-subtitle {
      color: var(--text-secondary);
      margin-bottom: 24px;
    }
    .checkout-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .section-heading {
      font-size: 1.15rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
      margin-bottom: 4px;
    }
    .form-error {
      color: var(--danger);
      font-size: 0.8rem;
      margin-top: 4px;
      display: block;
    }
    .payment-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .payment-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-surface-elevated);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .payment-card:hover {
      border-color: #6366f1;
    }
    .payment-card.selected {
      border-color: var(--primary);
      background: rgba(79, 70, 229, 0.1);
    }
    .payment-label {
      display: flex;
      flex-direction: column;
    }
    .p-title {
      font-weight: 600;
      color: var(--text-main);
    }
    .p-sub {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .btn-submit-order {
      width: 100%;
      padding: 16px;
      font-size: 1.05rem;
    }

    /* Summary Sidebar */
    .summary-card {
      position: sticky;
      top: 100px;
    }
    .summary-heading {
      font-size: 1.15rem;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
    }
    .sidebar-items {
      display: flex;
      flex-direction: column;
      gap: 14px;
      max-height: 320px;
      overflow-y: auto;
      padding-right: 6px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 16px;
      margin-bottom: 16px;
    }
    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .sidebar-thumb {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: var(--radius-sm);
    }
    .sidebar-item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .sidebar-name {
      font-size: 0.85rem;
      font-weight: 600;
      line-height: 1.2;
    }
    .sidebar-qty {
      font-size: 0.75rem;
    }
    .sidebar-item-price {
      font-size: 0.9rem;
      font-weight: 700;
    }
    .sidebar-totals {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .tot-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.95rem;
    }
    .tot-grand {
      font-size: 1.25rem;
      font-weight: 800;
      border-top: 1px solid var(--border);
      padding-top: 12px;
      margin-top: 6px;
    }

    /* Success State */
    .order-success-card {
      max-width: 600px;
      margin: 40px auto;
      text-align: center;
      padding: 48px 36px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .success-icon {
      font-size: 3.5rem;
    }
    .success-title {
      font-size: 2rem;
    }
    .success-desc {
      color: var(--text-secondary);
      line-height: 1.6;
    }
    .order-summary-box {
      width: 100%;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      text-align: left;
      margin: 12px 0;
    }
    .box-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
    }
    .box-row .label {
      color: var(--text-secondary);
    }
    .success-actions {
      display: flex;
      gap: 16px;
    }
    .empty-checkout-card {
      max-width: 500px;
      margin: 60px auto;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 40px;
    }

    @media (max-width: 900px) {
      .checkout-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  cartService = inject(CartService);
  orderService = inject(OrderService);
  authService = inject(AuthService);
  notification = inject(NotificationService);
  fb = inject(FormBuilder);
  router = inject(Router);

  isSubmitting = signal<boolean>(false);
  orderSuccess = signal<Order | null>(null);

  checkoutForm!: FormGroup;

  ngOnInit() {
    const user = this.authService.currentUser();
    this.checkoutForm = this.fb.group({
      shippingName: [user?.fullName || '', [Validators.required]],
      shippingAddress: ['', [Validators.required, Validators.minLength(5)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9\-\+\s]{8,15}$/)]],
      paymentMethod: ['CREDIT_CARD', [Validators.required]]
    });
  }

  submitOrder() {
    if (this.checkoutForm.invalid || this.cartService.items().length === 0) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formVal = this.checkoutForm.value;
    const request = {
      items: this.cartService.items().map(i => ({
        productId: i.product.id,
        quantity: i.quantity
      })),
      shippingName: formVal.shippingName,
      shippingAddress: formVal.shippingAddress,
      phone: formVal.phone,
      paymentMethod: formVal.paymentMethod
    };

    this.orderService.createOrder(request).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success && res.data) {
          this.orderSuccess.set(res.data);
          this.cartService.clearCart();
          this.notification.success('Order placed successfully!');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.notification.error(err.error?.message || 'Failed to place order');
      }
    });
  }
}
