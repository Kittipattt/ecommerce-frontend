import { Order } from './order.model';
import { Product } from './product.model';

export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockCount: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
}
