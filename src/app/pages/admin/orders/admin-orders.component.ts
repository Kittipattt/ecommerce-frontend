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
    <div class="admin-page">
      <div class="admin-header">
        <div>
          <div class="breadcrumb">
            <a routerLink="/admin/dashboard">Admin</a> / <span>Fulfillment</span>
          </div>
          <h1 class="page-title">Manage Orders</h1>
          <p class="page-subtitle">Track customer orders, update shipping progress and delivery states</p>
        </div>
      </div>

      <!-- Orders Table Card -->
      <div class="card table-card">
        @if (isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading customer orders...</p>
          </div>
        } @else if (orders().length === 0) {
          <div class="empty-state">
            <p>No orders recorded in the system yet.</p>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer Info</th>
                  <th>Items Purchased</th>
                  <th>Total Amount</th>
                  <th>Placed Date</th>
                  <th>Order Status Workflow</th>
                </tr>
              </thead>
              <tbody>
                @for (order of orders(); track order.id) {
                  <tr>
                    <td>
                      <strong class="font-mono text-primary">{{ order.orderNumber }}</strong>
                    </td>
                    <td>
                      <div class="customer-info-cell">
                        <span class="c-name font-bold">{{ order.shippingName }}</span>
                        <span class="c-phone text-secondary">{{ order.phone }}</span>
                        <span class="c-addr text-secondary">{{ order.shippingAddress }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="order-items-cell">
                        @for (item of order.items; track item.id) {
                          <div class="item-line">
                            <span>{{ item.quantity }}x {{ item.productName }}</span>
                          </div>
                        }
                      </div>
                    </td>
                    <td>
                      <strong class="text-accent font-bold">\${{ order.totalAmount | number:'1.2-2' }}</strong>
                    </td>
                    <td>
                      <span class="text-secondary">{{ order.createdAt | date:'short' }}</span>
                    </td>
                    <td>
                      <select
                        class="form-control status-select"
                        [ngClass]="'status-' + order.status.toLowerCase()"
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
  `,
  styles: [`
    .admin-page {
      max-width: 1280px;
      margin: 40px auto 80px auto;
      padding: 0 24px;
      width: 100%;
    }
    .breadcrumb {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }
    .breadcrumb a {
      color: #818cf8;
    }
    .admin-header {
      margin-bottom: 32px;
    }
    .page-title {
      font-size: 2rem;
    }
    .page-subtitle {
      color: var(--text-secondary);
      margin-top: 4px;
    }
    .table-card {
      padding: 0;
      overflow: hidden;
    }
    .customer-info-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-width: 220px;
      font-size: 0.85rem;
    }
    .c-name {
      color: var(--text-main);
    }
    .c-phone, .c-addr {
      font-size: 0.775rem;
      line-height: 1.3;
    }
    .order-items-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.85rem;
    }
    .status-select {
      width: auto;
      padding: 6px 12px;
      font-size: 0.825rem;
      font-weight: 700;
      border-radius: var(--radius-sm);
      cursor: pointer;
    }
    .status-pending { border-color: var(--warning); color: #fcd34d; }
    .status-processing { border-color: var(--primary); color: #a5b4fc; }
    .status-shipped { border-color: var(--accent); color: #67e8f9; }
    .status-delivered { border-color: var(--success); color: #6ee7b7; }
    .status-cancelled { border-color: var(--danger); color: #fca5a5; }

    .loading-state, .empty-state {
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
