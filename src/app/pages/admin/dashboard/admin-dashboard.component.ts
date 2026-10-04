import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../services/dashboard.service';
import { DashboardSummary } from '../../../models/dashboard.model';
import { OrderStatus } from '../../../models/order.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-6 py-10 w-full">
      <!-- Admin Header -->
      <div class="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h1 class="font-heading text-3xl font-extrabold text-white">Executive Dashboard</h1>
          <p class="text-sm text-gray-400 mt-1">Real-time overview of store performance, revenue and fulfillment</p>
        </div>
        <div class="flex gap-3">
          <a routerLink="/admin/products" class="btn btn-secondary btn-sm">Manage Products</a>
          <a routerLink="/admin/orders" class="btn btn-secondary btn-sm">Manage Orders</a>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex flex-col items-center gap-4 py-20 text-gray-400">
          <div class="w-10 h-10 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p class="text-sm">Compiling analytics from backend...</p>
        </div>
      } @else if (summary(); as data) {
        <!-- KPI Metrics Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div class="p-5 rounded-2xl bg-gray-900 border border-gray-800 flex items-center gap-4 shadow-lg hover:border-gray-700 transition-colors">
            <div class="w-14 h-14 rounded-xl bg-gray-800/80 border border-gray-700/60 flex items-center justify-center text-2xl shrink-0">💰</div>
            <div class="flex flex-col">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Revenue</span>
              <span class="font-heading font-extrabold text-2xl text-cyan-400 font-mono mt-0.5">\${{ data.totalRevenue | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="p-5 rounded-2xl bg-gray-900 border border-gray-800 flex items-center gap-4 shadow-lg hover:border-gray-700 transition-colors">
            <div class="w-14 h-14 rounded-xl bg-gray-800/80 border border-gray-700/60 flex items-center justify-center text-2xl shrink-0">🛒</div>
            <div class="flex flex-col">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Orders</span>
              <span class="font-heading font-extrabold text-2xl text-white font-mono mt-0.5">{{ data.totalOrders }}</span>
            </div>
          </div>

          <div class="p-5 rounded-2xl bg-gray-900 border border-gray-800 flex items-center gap-4 shadow-lg hover:border-gray-700 transition-colors">
            <div class="w-14 h-14 rounded-xl bg-gray-800/80 border border-gray-700/60 flex items-center justify-center text-2xl shrink-0">📦</div>
            <div class="flex flex-col">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Products</span>
              <span class="font-heading font-extrabold text-2xl text-white font-mono mt-0.5">{{ data.totalProducts }}</span>
            </div>
          </div>

          <div class="p-5 rounded-2xl bg-gray-900 border border-gray-800 flex items-center gap-4 shadow-lg hover:border-gray-700 transition-colors">
            <div class="w-14 h-14 rounded-xl bg-gray-800/80 border border-gray-700/60 flex items-center justify-center text-2xl shrink-0">⚠️</div>
            <div class="flex flex-col">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Low Stock Alerts</span>
              <span class="font-heading font-extrabold text-2xl font-mono mt-0.5" [ngClass]="data.lowStockCount > 0 ? 'text-red-400' : 'text-gray-200'">{{ data.lowStockCount }}</span>
            </div>
          </div>
        </div>

        <!-- Low Stock Warning Banner -->
        @if (data.lowStockProducts.length > 0) {
          <div class="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/40 mb-8 space-y-3">
            <div class="flex items-center gap-2.5 text-amber-300 font-semibold text-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <span>Inventory Attention Required: {{ data.lowStockProducts.length }} items have critically low stock</span>
            </div>
            <div class="flex flex-wrap gap-2">
              @for (item of data.lowStockProducts; track item.id) {
                <span class="bg-gray-900 border border-gray-800 px-3 py-1 rounded-lg text-xs text-gray-300">
                  {{ item.name }} <strong class="text-red-400">({{ item.stockQuantity }} left)</strong>
                </span>
              }
            </div>
          </div>
        }

        <!-- Recent Orders Table Card -->
        <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 shadow-xl space-y-4">
          <div class="flex justify-between items-center pb-2">
            <h3 class="font-heading font-bold text-lg text-white">Recent Orders</h3>
            <a routerLink="/admin/orders" class="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">View All Orders →</a>
          </div>

          <div class="overflow-x-auto rounded-xl border border-gray-800">
            <table class="w-full text-left text-sm text-gray-300">
              <thead class="bg-gray-800/80 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-800">
                <tr>
                  <th class="px-5 py-3.5 font-semibold">Order #</th>
                  <th class="px-5 py-3.5 font-semibold">Customer</th>
                  <th class="px-5 py-3.5 font-semibold">Date</th>
                  <th class="px-5 py-3.5 font-semibold">Total</th>
                  <th class="px-5 py-3.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-800/60">
                @for (order of data.recentOrders; track order.id) {
                  <tr class="hover:bg-gray-800/30 transition-colors">
                    <td class="px-5 py-4 font-mono font-bold text-indigo-400">{{ order.orderNumber }}</td>
                    <td class="px-5 py-4 text-gray-200">{{ order.shippingName }}</td>
                    <td class="px-5 py-4 text-gray-400">{{ order.createdAt | date:'shortDate' }}</td>
                    <td class="px-5 py-4 font-mono font-bold text-gray-200">\${{ order.totalAmount | number:'1.2-2' }}</td>
                    <td class="px-5 py-4">
                      <span class="badge" [ngClass]="getStatusBadge(order.status)">
                        {{ order.status }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  dashboardService = inject(DashboardService);

  summary = signal<DashboardSummary | null>(null);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.dashboardService.getDashboardSummary().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.summary.set(res.data);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  getStatusBadge(status: OrderStatus): string {
    switch (status) {
      case 'DELIVERED': return 'badge-success';
      case 'SHIPPED': return 'badge-info';
      case 'PROCESSING': return 'badge-primary';
      case 'PENDING': return 'badge-warning';
      default: return 'badge-danger';
    }
  }
}
