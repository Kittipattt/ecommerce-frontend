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
    <div class="max-w-6xl mx-auto px-6 py-10 w-full">
      @if (orderSuccess(); as order) {
        <!-- Order Success State -->
        <div class="max-w-xl mx-auto p-8 sm:p-10 rounded-2xl bg-gray-900 border border-gray-800 text-center flex flex-col items-center gap-4 shadow-2xl animate-in zoom-in-95 duration-200">
          <div class="text-6xl mb-1">🎉</div>
          <div class="badge badge-success">Order Confirmed</div>
          <h2 class="font-heading text-2xl sm:text-3xl font-bold text-white">Thank You For Your Order!</h2>
          <p class="text-sm text-gray-400 max-w-md leading-relaxed">
            Your payment was processed and your order has been received. Our fulfillment team is preparing your package.
          </p>

          <div class="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl p-5 space-y-2.5 text-left my-2 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Order Number:</span>
              <span class="text-indigo-400 font-mono font-bold">{{ order.orderNumber }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Recipient:</span>
              <span class="text-gray-200 font-medium">{{ order.shippingName }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Shipping Address:</span>
              <span class="text-gray-200 font-medium max-w-[240px] truncate text-right">{{ order.shippingAddress }}</span>
            </div>
            <div class="flex justify-between items-center pt-2 border-t border-gray-700/60">
              <span class="text-gray-400">Total Paid:</span>
              <span class="font-heading font-extrabold text-lg text-cyan-400 font-mono">\${{ order.totalAmount | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="flex gap-4 mt-2 w-full sm:w-auto">
            <a routerLink="/my-orders" class="btn btn-primary flex-1 sm:flex-initial">
              View My Orders
            </a>
            <a routerLink="/" class="btn btn-secondary flex-1 sm:flex-initial">
              Back to Store
            </a>
          </div>
        </div>
      } @else if (cartService.items().length === 0) {
        <!-- Empty Cart Redirect State -->
        <div class="max-w-md mx-auto p-10 rounded-2xl bg-gray-900 border border-gray-800 text-center flex flex-col items-center gap-4 shadow-xl">
          <div class="text-5xl">🛍️</div>
          <h2 class="font-heading text-2xl font-bold text-gray-200">Your cart is empty</h2>
          <p class="text-sm text-gray-400">Please add items to your cart before proceeding to checkout.</p>
          <a routerLink="/" class="btn btn-primary mt-2">Explore Products</a>
        </div>
      } @else {
        <!-- Checkout Flow -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div class="lg:col-span-7 space-y-6">
            <div>
              <h1 class="font-heading text-3xl font-extrabold text-white">Secure Checkout</h1>
              <p class="text-sm text-gray-400 mt-1">Please provide your delivery information and payment preference</p>
            </div>

            <form [formGroup]="checkoutForm" (ngSubmit)="submitOrder()" class="space-y-6">
              <!-- Shipping Information -->
              <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4 shadow-lg">
                <h3 class="font-heading font-bold text-lg text-white border-b border-gray-800 pb-3">1. Shipping Information</h3>

                <div>
                  <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    formControlName="shippingName"
                    class="form-control"
                    placeholder="Recipient's name"
                  />
                  @if (checkoutForm.get('shippingName')?.touched && checkoutForm.get('shippingName')?.invalid) {
                    <span class="text-xs text-red-400 mt-1 block">Recipient name is required</span>
                  }
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Phone Number *</label>
                  <input
                    type="tel"
                    formControlName="phone"
                    class="form-control"
                    placeholder="e.g. 081-234-5678"
                  />
                  @if (checkoutForm.get('phone')?.touched && checkoutForm.get('phone')?.invalid) {
                    <span class="text-xs text-red-400 mt-1 block">Valid contact phone number is required</span>
                  }
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Delivery Address *</label>
                  <textarea
                    rows="3"
                    formControlName="shippingAddress"
                    class="form-control"
                    placeholder="Street address, building, subdistrict, postal code"
                  ></textarea>
                  @if (checkoutForm.get('shippingAddress')?.touched && checkoutForm.get('shippingAddress')?.invalid) {
                    <span class="text-xs text-red-400 mt-1 block">Shipping address is required</span>
                  }
                </div>
              </div>

              <!-- Payment Method -->
              <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4 shadow-lg">
                <h3 class="font-heading font-bold text-lg text-white border-b border-gray-800 pb-3">2. Payment Method</h3>
                <div class="space-y-3">
                  <label
                    class="flex items-center gap-3.5 p-4 rounded-xl border transition-all cursor-pointer"
                    [ngClass]="checkoutForm.get('paymentMethod')?.value === 'CREDIT_CARD' ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/50' : 'border-gray-800 bg-gray-800/40 hover:border-gray-700'">
                    <input type="radio" value="CREDIT_CARD" formControlName="paymentMethod" class="accent-indigo-500 w-4 h-4" />
                    <div>
                      <span class="font-semibold text-sm text-gray-200 block">Credit / Debit Card</span>
                      <span class="text-xs text-gray-400 block mt-0.5">Visa, Mastercard, JCB (Instant simulated auth)</span>
                    </div>
                  </label>

                  <label
                    class="flex items-center gap-3.5 p-4 rounded-xl border transition-all cursor-pointer"
                    [ngClass]="checkoutForm.get('paymentMethod')?.value === 'PROMPTPAY' ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/50' : 'border-gray-800 bg-gray-800/40 hover:border-gray-700'">
                    <input type="radio" value="PROMPTPAY" formControlName="paymentMethod" class="accent-indigo-500 w-4 h-4" />
                    <div>
                      <span class="font-semibold text-sm text-gray-200 block">PromptPay / Mobile Banking</span>
                      <span class="text-xs text-gray-400 block mt-0.5">Zero-fee instant transfer QR</span>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-primary btn-block py-4 text-base font-heading font-bold shadow-xl shadow-indigo-500/25"
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
          <div class="lg:col-span-5 sticky top-24">
            <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-5 shadow-xl">
              <h3 class="font-heading font-bold text-lg text-white border-b border-gray-800 pb-3">Order Summary</h3>

              <div class="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                @for (item of cartService.items(); track item.product.id) {
                  <div class="flex items-center gap-3.5">
                    <img [src]="item.product.imageUrl" [alt]="item.product.name" class="w-12 h-12 rounded-lg object-cover bg-gray-800 border border-gray-700/60 shrink-0" />
                    <div class="flex-1 min-w-0">
                      <span class="text-sm font-semibold text-gray-200 block truncate">{{ item.product.name }}</span>
                      <span class="text-xs text-gray-400">Qty: {{ item.quantity }}</span>
                    </div>
                    <span class="font-mono text-sm font-bold text-gray-200">\${{ (item.product.price * item.quantity) | number:'1.2-2' }}</span>
                  </div>
                }
              </div>

              <div class="border-t border-gray-800 pt-4 space-y-2.5 text-sm">
                <div class="flex justify-between items-center text-gray-400">
                  <span>Subtotal</span>
                  <span class="font-mono text-gray-200 font-semibold">\${{ cartService.totalAmount() | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between items-center text-emerald-400 text-xs font-semibold">
                  <span>Express Delivery</span>
                  <span>FREE</span>
                </div>
                <div class="flex justify-between items-center pt-3 border-t border-gray-800/80">
                  <span class="font-heading font-bold text-base text-white">Grand Total</span>
                  <span class="font-heading font-extrabold text-xl text-indigo-400 font-mono">\${{ cartService.totalAmount() | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
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
