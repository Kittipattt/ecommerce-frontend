import { Injectable, computed, inject, signal } from '@angular/core';
import { CartItem } from '../models/order.model';
import { Product } from '../models/product.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private notification = inject(NotificationService);
  private readonly CART_KEY = 'nexus_cart_items';

  items = signal<CartItem[]>(this.getStoredCart());
  isCartOpen = signal<boolean>(false);

  itemCount = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  totalAmount = computed(() =>
    this.items().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  addToCart(product: Product, quantity = 1) {
    if (product.stockQuantity <= 0) {
      this.notification.error('Product is out of stock');
      return;
    }

    const currentItems = [...this.items()];
    const existingIndex = currentItems.findIndex(i => i.product.id === product.id);

    if (existingIndex > -1) {
      const existing = currentItems[existingIndex];
      const newQty = existing.quantity + quantity;

      if (newQty > product.stockQuantity) {
        this.notification.warning(`Cannot add more than ${product.stockQuantity} items in stock`);
        return;
      }

      currentItems[existingIndex] = { ...existing, quantity: newQty };
    } else {
      currentItems.push({ product, quantity });
    }

    this.updateCart(currentItems);
    this.notification.success(`Added ${product.name} to cart`);
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = this.items().map(item => {
      if (item.product.id === productId) {
        if (quantity > item.product.stockQuantity) {
          this.notification.warning(`Only ${item.product.stockQuantity} items left in stock`);
          return { ...item, quantity: item.product.stockQuantity };
        }
        return { ...item, quantity };
      }
      return item;
    });

    this.updateCart(currentItems);
  }

  removeFromCart(productId: number) {
    const filtered = this.items().filter(i => i.product.id !== productId);
    this.updateCart(filtered);
    this.notification.info('Item removed from cart');
  }

  clearCart() {
    this.updateCart([]);
  }

  toggleCart() {
    this.isCartOpen.update(v => !v);
  }

  openCart() {
    this.isCartOpen.set(true);
  }

  closeCart() {
    this.isCartOpen.set(false);
  }

  private updateCart(items: CartItem[]) {
    this.items.set(items);
    localStorage.setItem(this.CART_KEY, JSON.stringify(items));
  }

  private getStoredCart(): CartItem[] {
    const raw = localStorage.getItem(this.CART_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
}
