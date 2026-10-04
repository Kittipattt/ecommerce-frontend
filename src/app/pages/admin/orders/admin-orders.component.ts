import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { NotificationService } from '../../../services/notification.service';
import { Order, OrderStatus } from '../../../models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-6 py-10 w-full">
      <div class="mb-8">
        <div class="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
          <a routerLink="/admin/dashboard" class="text-indigo-400 hover:text-indigo-300">Admin</a>
          <span>/</span>
          <span>Fulfillment</span>
        </div>
        <h1 class="font-heading text-3xl font-extrabold text-white">Manage Orders</h1>
        <p class="text-sm text-gray-400 mt-1">Track customer orders, update shipping progress and delivery states</p>
      </div>

      <!-- Orders Table Card -->
      <div class="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden shadow-xl">
        @if (isLoading()) {
          <div class="flex flex-col items-center gap-4 py-20 text-gray-400">
            <div class="w-10 h-10 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p class="text-sm">Loading customer orders...</p>
          </div>
        } @else if (orders().length === 0) {
          <div class="py-20 text-center text-gray-400">
            <p>No orders recorded in the system yet.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-300">
              <thead class="bg-gray-800/80 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-800">
                <tr>
                  <th class="px-5 py-4 font-semibold">Order #</th>
                  <th class="px-5 py-4 font-semibold">Customer Info</th>
                  <th class="px-5 py-4 font-semibold">Items Purchased</th>
                  <th class="px-5 py-4 font-semibold">Total Amount</th>
                  <th class="px-5 py-4 font-semibold">Placed Date</th>
                  <th class="px-5 py-4 font-semibold">Order Status Workflow</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-800/60">
                @for (order of orders(); track order.id) {
                  <tr class="hover:bg-gray-800/30 transition-colors">
                    <td class="px-5 py-4">
                      <strong class="font-mono text-indigo-400">{{ order.orderNumber }}</strong>
                    </td>
                    <td class="px-5 py-4">
                      <div class="flex flex-col gap-0.5 max-w-[220px] text-xs">
                        <span class="font-bold text-gray-200 text-sm">{{ order.shippingName }}</span>
                        <span class="text-gray-400">{{ order.phone }}</span>
                        <span class="text-gray-400 leading-tight">{{ order.shippingAddress }}</span>
                      </div>
                    </td>
                    <td class="px-5 py-4">
                      <div class="flex flex-col gap-1 text-xs text-gray-300">
                        @for (item of order.items; track item.id) {
                          <div>
                            <span>{{ item.quantity }}x {{ item.productName }}</span>
                          </div>
                        }
                      </div>
                    </td>
                    <td class="px-5 py-4">
                      <strong class="text-cyan-400 font-bold font-mono">\${{ order.totalAmount | number:'1.2-2' }}</strong>
                    </td>
                    <td class="px-5 py-4">
                      <span class="text-gray-400 text-xs">{{ order.createdAt | date:'short' }}</span>
                    </td>
                    <td class="px-5 py-4">
                      <select
                        class="bg-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer outline-none transition-colors"
                        [ngClass]="{
                          'border-amber-500/50 text-amber-300': order.status === 'PENDING',
                          'border-indigo-500/50 text-indigo-300': order.status === 'PROCESSING',
                          'border-cyan-500/50 text-cyan-300': order.status === 'SHIPPED',
                          'border-emerald-500/50 text-emerald-300': order.status === 'DELIVERED',
                          'border-red-500/50 text-red-300': order.status === 'CANCELLED'
                        }"
                        [ngModel]="order.status"
                        (ngModelChange)="onStatusChange(order, $event)">
                        <option value="PENDING">PENDING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  orderService = inject(OrderService);
  notification = inject(NotificationService);

  orders = signal<Order[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading.set(true);
    this.orderService.getAllOrders(0, 50).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.orders.set(res.data.content);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  onStatusChange(order: Order, newStatus: OrderStatus) {
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: (res) => {
        if (res.success) {
          order.status = newStatus;
          this.notification.success(`Order ${order.orderNumber} updated to ${newStatus}`);
        }
      },
      error: (err) => this.notification.error(err.error?.message || 'Failed to update order status')
    });
  }
}
