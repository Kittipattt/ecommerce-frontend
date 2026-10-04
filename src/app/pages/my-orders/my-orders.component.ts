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
    <div class="orders-page">
      <div class="orders-header">
        <div>
          <h1 class="page-title">My Orders</h1>
          <p class="page-subtitle">Track your delivery status and purchase history</p>
        </div>
        <a routerLink="/" class="btn btn-secondary btn-sm">Continue Shopping</a>
      </div>

      @if (isLoading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Retrieving your order history...</p>
        </div>
      } @else if (orders().length === 0) {
        <div class="empty-orders card">
          <div class="empty-icon">📦</div>
          <h3>No Orders Yet</h3>
          <p>You haven't placed any orders yet. Discover our premium gear and enjoy fast shipping!</p>
          <a routerLink="/" class="btn btn-primary">Start Shopping</a>
        </div>
      } @else {
        <div class="orders-list">
          @for (order of orders(); track order.id) {
            <div class="card order-card">
              <div class="order-card-header">
                <div class="order-meta">
                  <span class="order-id">Order <strong class="font-mono text-primary">{{ order.orderNumber }}</strong></span>
                  <span class="order-date text-secondary">Placed on {{ order.createdAt | date:'mediumDate' }}</span>
                </div>
                <div class="order-status-badge">
                  <span class="badge" [ngClass]="getStatusBadgeClass(order.status)">
                    {{ order.status }}
                  </span>
                </div>
              </div>

              <div class="order-items-list">
                @for (item of order.items; track item.id) {
                  <div class="order-item-row">
                    <img [src]="item.product.imageUrl" [alt]="item.productName" class="item-img" />
                    <div class="item-info">
                      <span class="item-name">{{ item.productName }}</span>
                      <span class="item-qty text-secondary">Quantity: {{ item.quantity }}</span>
                    </div>
                    <span class="item-price">\${{ (item.price * item.quantity) | number:'1.2-2' }}</span>
                  </div>
                }
              </div>

              <div class="order-card-footer">
                <div class="shipping-info">
                  <span class="shipping-label">Ship to:</span>
                  <span class="shipping-val">{{ order.shippingName }} • {{ order.shippingAddress }}</span>
                </div>
                <div class="order-total">
                  <span class="total-label">Total Amount:</span>
                  <span class="total-val">\${{ order.totalAmount | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .orders-page {
      max-width: 1000px;
      margin: 40px auto 80px auto;
      padding: 0 24px;
      width: 100%;
    }
    .orders-header {
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
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .order-card {
      padding: 0;
      overflow: hidden;
    }
    .order-card-header {
      padding: 18px 24px;
      background: var(--bg-surface-elevated);
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .order-meta {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .order-id {
      font-size: 0.95rem;
    }
    .order-date {
      font-size: 0.85rem;
    }
    .order-items-list {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .order-item-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .item-img {
      width: 56px;
      height: 56px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
    }
    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .item-name {
      font-weight: 600;
      font-size: 0.95rem;
    }
    .item-qty {
      font-size: 0.8rem;
    }
    .item-price {
      font-weight: 700;
      font-size: 1rem;
    }
    .order-card-footer {
      padding: 16px 24px;
      background: rgba(0, 0, 0, 0.2);
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .shipping-info {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    .shipping-val {
      color: var(--text-main);
      margin-left: 6px;
    }
    .order-total {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .total-label {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    .total-val {
      font-family: var(--font-heading);
      font-size: 1.3rem;
      font-weight: 800;
      color: #818cf8;
    }
    .empty-orders {
      text-align: center;
      padding: 60px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }
    .empty-icon {
      font-size: 3rem;
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
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
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
