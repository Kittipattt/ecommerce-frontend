import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-10 w-full">
      <div class="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h1 class="font-heading text-3xl font-extrabold text-white">My Orders</h1>
          <p class="text-sm text-gray-400 mt-1">Track your delivery status and purchase history</p>
        </div>
        <a routerLink="/" class="btn btn-secondary btn-sm">Continue Shopping</a>
      </div>

      @if (isLoading()) {
        <div class="flex flex-col items-center gap-4 py-16 text-gray-400">
          <div class="w-10 h-10 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p class="text-sm">Retrieving your order history...</p>
        </div>
      } @else if (orders().length === 0) {
        <div class="p-12 rounded-2xl bg-gray-900 border border-gray-800 text-center flex flex-col items-center gap-3">
          <div class="text-5xl mb-2">📦</div>
          <h3 class="font-heading text-xl font-bold text-gray-200">No Orders Yet</h3>
          <p class="text-sm text-gray-400 max-w-sm">You haven't placed any orders yet. Discover our premium gear and enjoy fast shipping!</p>
          <a routerLink="/" class="btn btn-primary mt-3">Start Shopping</a>
        </div>
      } @else {
        <div class="space-y-6">
          @for (order of orders(); track order.id) {
            <div class="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden shadow-xl">
              <!-- Order Header -->
              <div class="p-5 sm:px-6 bg-gray-800/60 border-b border-gray-800 flex justify-between items-center flex-wrap gap-3">
                <div class="flex items-center gap-4 flex-wrap text-sm">
                  <span class="text-gray-300">Order <strong class="font-mono text-indigo-400">{{ order.orderNumber }}</strong></span>
                  <span class="text-gray-500">•</span>
                  <span class="text-gray-400">Placed on {{ order.createdAt | date:'mediumDate' }}</span>
                </div>
                <div>
                  <span class="badge" [ngClass]="getStatusBadgeClass(order.status)">
                    {{ order.status }}
                  </span>
                </div>
              </div>

              <!-- Order Items -->
              <div class="p-5 sm:p-6 space-y-4">
                @for (item of order.items; track item.id) {
                  <div class="flex items-center gap-4">
                    <img [src]="item.product.imageUrl" [alt]="item.productName" class="w-14 h-14 rounded-xl object-cover border border-gray-700/60 shrink-0 bg-gray-800" />
                    <div class="flex-1 min-w-0">
                      <span class="font-semibold text-sm text-gray-200 block truncate">{{ item.productName }}</span>
                      <span class="text-xs text-gray-400 mt-0.5 block">Quantity: {{ item.quantity }}</span>
                    </div>
                    <span class="font-mono font-bold text-sm text-gray-200">\${{ (item.price * item.quantity) | number:'1.2-2' }}</span>
                  </div>
                }
              </div>

              <!-- Order Footer -->
              <div class="px-6 py-4 bg-black/20 border-t border-gray-800/80 flex justify-between items-center flex-wrap gap-3">
                <div class="text-xs text-gray-400">
                  <span>Ship to:</span>
                  <span class="text-gray-200 ml-1.5 font-medium">{{ order.shippingName }} • {{ order.shippingAddress }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-400">Total Amount:</span>
                  <span class="font-heading font-extrabold text-lg text-indigo-400 font-mono">\${{ order.totalAmount | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class MyOrdersComponent implements OnInit {
  orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.orders.set(res.data);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case 'DELIVERED': return 'badge-success';
      case 'SHIPPED': return 'badge-info';
      case 'PROCESSING': return 'badge-primary';
      case 'PENDING': return 'badge-warning';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }
}
