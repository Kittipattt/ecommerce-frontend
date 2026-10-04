import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { AdminDashboardComponent } from './pages/admin/dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './pages/admin/products/admin-products.component';
import { AdminOrdersComponent } from './pages/admin/orders/admin-orders.component';
import { authGuard, adminGuard } from './core/guards';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'NexusTech | Storefront' },
  { path: 'login', component: LoginComponent, title: 'NexusTech | Sign In' },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard], title: 'NexusTech | Checkout' },
  { path: 'my-orders', component: MyOrdersComponent, canActivate: [authGuard], title: 'NexusTech | My Orders' },
  {
    path: 'admin',
    children: [
      { path: 'dashboard', component: AdminDashboardComponent, canActivate: [adminGuard], title: 'Admin | Dashboard' },
      { path: 'products', component: AdminProductsComponent, canActivate: [adminGuard], title: 'Admin | Products' },
      { path: 'orders', component: AdminOrdersComponent, canActivate: [adminGuard], title: 'Admin | Orders' },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
