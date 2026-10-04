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
    <div class="admin-page">
      <div class="admin-header">
        <div>
          <h1 class="page-title">Executive Dashboard</h1>
          <p class="page-subtitle">Real-time overview of store performance, revenue and fulfillment</p>
        </div>
        <div class="admin-nav-actions">
          <a routerLink="/admin/products" class="btn btn-secondary btn-sm">Manage Products</a>
          <a routerLink="/admin/orders" class="btn btn-secondary btn-sm">Manage Orders</a>
        </div>
      </div>

      @if (isLoading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Compiling analytics from backend...</p>
        </div>
      } @else if (summary(); as data) {
        <!-- KPI Metrics Grid -->
        <div class="metrics-grid">
          <div class="card metric-card">
            <div class="metric-icon revenue-icon">💰</div>
            <div class="metric-details">
              <span class="metric-label">Total Revenue</span>
              <span class="metric-value text-accent">\${{ data.totalRevenue | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="card metric-card">
            <div class="metric-icon orders-icon">🛒</div>
            <div class="metric-details">
              <span class="metric-label">Total Orders</span>
              <span class="metric-value">{{ data.totalOrders }}</span>
            </div>
          </div>

          <div class="card metric-card">
            <div class="metric-icon products-icon">📦</div>
            <div class="metric-details">
              <span class="metric-label">Active Products</span>
              <span class="metric-value">{{ data.totalProducts }}</span>
            </div>
          </div>

          <div class="card metric-card">
            <div class="metric-icon stock-icon">⚠️</div>
            <div class="metric-details">
              <span class="metric-label">Low Stock Alerts</span>
              <span class="metric-value" [class.text-danger]="data.lowStockCount > 0">{{ data.lowStockCount }}</span>
            </div>
          </div>
        </div>

        <!-- Low Stock Warning Banner -->
        @if (data.lowStockProducts.length > 0) {
          <div class="card warning-banner">
            <div class="banner-title">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <span>Inventory Attention Required: {{ data.lowStockProducts.length }} items have critically low stock</span>
            </div>
            <div class="low-stock-pills">
              @for (item of data.lowStockProducts; track item.id) {
                <span class="stock-pill">
                  {{ item.name }} <strong>({{ item.stockQuantity }} left)</strong>
                </span>
              }
            </div>
          </div>
        }

        <!-- Recent Orders Table -->
        <div class="card table-card">
          <div class="table-card-header">
            <h3>Recent Orders</h3>
            <a routerLink="/admin/orders" class="link-view-all">View All Orders →</a>
          </div>

          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (order of data.recentOrders; track order.id) {
                  <tr>
                    <td><strong class="font-mono text-primary">{{ order.orderNumber }}</strong></td>
                    <td>{{ order.shippingName }}</td>
                    <td>{{ order.createdAt | date:'shortDate' }}</td>
                    <td>\${{ order.totalAmount | number:'1.2-2' }}</td>
                    <td>
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
  `,
  styles: [`
    .admin-page {
      max-width: 1280px;
      margin: 40px auto 80px auto;
      padding: 0 24px;
      width: 100%;
    }
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .page-title {
      font-size: 2rem;
    }
    .page-subtitle {
      color: var(--text-secondary);
      margin-top: 4px;
    }
    .admin-nav-actions {
      display: flex;
      gap: 12px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 28px;
    }
    .metric-card {
      display: flex;
      align-items: center;
      gap: 18px;
      padding: 20px;
    }
    .metric-icon {
      font-size: 2rem;
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border);
    }
    .metric-details {
      display: flex;
      flex-direction: column;
    }
    .metric-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .metric-value {
      font-family: var(--font-heading);
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .text-danger {
      color: var(--danger) !important;
    }
    .warning-banner {
      background: rgba(245, 158, 11, 0.1);
      border-color: rgba(245, 158, 11, 0.4);
      margin-bottom: 28px;
      padding: 20px;
    }
    .banner-title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #fcd34d;
      font-weight: 600;
      font-size: 0.95rem;
      margin-bottom: 12px;
    }
    .low-stock-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .stock-pill {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      padding: 4px 12px;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
    }
    .stock-pill strong {
      color: #fca5a5;
    }
    .table-card {
      padding: 24px;
    }
    .table-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }
    .link-view-all {
      font-size: 0.875rem;
      color: #818cf8;
      font-weight: 600;
    }
    .link-view-all:hover {
      text-decoration: underline;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 60px;
      color: var(--text-secondary);
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(79, 70, 229, 0.2);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
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
