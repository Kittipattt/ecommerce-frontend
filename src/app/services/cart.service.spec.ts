import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { NotificationService } from './notification.service';
import { Product } from '../models/product.model';

describe('CartService (Signals Testing)', () => {
  let service: CartService;
  let notificationService: NotificationService;

  const mockProduct: Product = {
    id: 1,
    name: 'Sony Headphones',
    description: 'Noise cancelling',
    price: 100,
    stockQuantity: 10,
    category: { id: 1, name: 'Audio', slug: 'audio', description: '', icon: '' },
    imageUrl: 'https://example.com/img.jpg',
    featured: true,
    rating: 5,
    reviewsCount: 10,
    createdAt: ''
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [CartService, NotificationService]
    });

    service = TestBed.inject(CartService);
    notificationService = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty cart signals', () => {
    expect(service.items()).toEqual([]);
    expect(service.itemCount()).toBe(0);
    expect(service.totalAmount()).toBe(0);
    expect(service.isCartOpen()).toBe(false);
  });

  it('should add product to cart and reactively compute itemCount and totalAmount', () => {
    service.addToCart(mockProduct, 2);

    expect(service.items().length).toBe(1);
    expect(service.items()[0].product.id).toBe(1);
    expect(service.items()[0].quantity).toBe(2);

    // Test computed signals
    expect(service.itemCount()).toBe(2);
    expect(service.totalAmount()).toBe(200);
  });

  it('should increment quantity when adding the same product again', () => {
    service.addToCart(mockProduct, 1);
    service.addToCart(mockProduct, 2);

    expect(service.items().length).toBe(1);
    expect(service.itemCount()).toBe(3);
    expect(service.totalAmount()).toBe(300);
  });

  it('should not add product when stockQuantity is 0', () => {
    const outOfStockProduct = { ...mockProduct, stockQuantity: 0 };
    service.addToCart(outOfStockProduct, 1);

    expect(service.items().length).toBe(0);
    expect(service.itemCount()).toBe(0);
  });

  it('should update item quantity correctly', () => {
    service.addToCart(mockProduct, 1);
    service.updateQuantity(mockProduct.id, 5);

    expect(service.itemCount()).toBe(5);
    expect(service.totalAmount()).toBe(500);
  });

  it('should remove item when updating quantity to 0', () => {
    service.addToCart(mockProduct, 2);
    service.updateQuantity(mockProduct.id, 0);

    expect(service.items().length).toBe(0);
    expect(service.itemCount()).toBe(0);
  });

  it('should remove item from cart with removeFromCart', () => {
    service.addToCart(mockProduct, 2);
    service.removeFromCart(mockProduct.id);

    expect(service.items().length).toBe(0);
    expect(service.totalAmount()).toBe(0);
  });

  it('should clear all items with clearCart', () => {
    service.addToCart(mockProduct, 2);
    service.clearCart();

    expect(service.items()).toEqual([]);
    expect(service.itemCount()).toBe(0);
  });

  it('should toggle, open, and close cart drawer signal', () => {
    expect(service.isCartOpen()).toBe(false);

    service.toggleCart();
    expect(service.isCartOpen()).toBe(true);

    service.closeCart();
    expect(service.isCartOpen()).toBe(false);

    service.openCart();
    expect(service.isCartOpen()).toBe(true);
  });
});
