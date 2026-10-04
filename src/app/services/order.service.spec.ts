import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OrderService } from './order.service';
import { Order, OrderCreateRequest, OrderStatus } from '../models/order.model';
import { ApiResponse } from '../models/api-response.model';

describe('OrderService', () => {
  let service: OrderService;
  let httpTesting: HttpTestingController;
  const baseUrl = 'http://localhost:8080/api/orders';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrderService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(OrderService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createOrder', () => {
    it('should send a POST request with order payload and return created order', () => {
      const mockRequest: OrderCreateRequest = {
        items: [{ productId: 1, quantity: 2 }],
        shippingName: 'John Doe',
        shippingAddress: '123 Bangkok St',
        phone: '0812345678',
        paymentMethod: 'CREDIT_CARD'
      };

      const mockResponse: ApiResponse<Order> = {
        success: true,
        message: 'Order placed successfully',
        data: {
          id: 101,
          orderNumber: 'ORD-2026-TEST',
          user: { id: 1, email: 'john@example.com', fullName: 'John Doe', role: 'ROLE_CUSTOMER', createdAt: '' },
          status: 'PENDING',
          totalAmount: 199.98,
          shippingName: 'John Doe',
          shippingAddress: '123 Bangkok St',
          phone: '0812345678',
          paymentMethod: 'CREDIT_CARD',
          items: [],
          createdAt: '2026-10-04T12:00:00'
        }
      };

      service.createOrder(mockRequest).subscribe((res) => {
        expect(res.success).toBe(true);
        expect(res.data.orderNumber).toBe('ORD-2026-TEST');
        expect(res.data.totalAmount).toBe(199.98);
      });

      const req = httpTesting.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);

      req.flush(mockResponse);
    });
  });

  describe('getMyOrders', () => {
    it('should send a GET request to /my-orders and return current user orders', () => {
      const mockResponse: ApiResponse<Order[]> = {
        success: true,
        message: 'User orders',
        data: [
          {
            id: 1,
            orderNumber: 'ORD-001',
            user: {} as any,
            status: 'DELIVERED',
            totalAmount: 349.99,
            shippingName: 'John Doe',
            shippingAddress: 'Bangkok',
            phone: '0812345678',
            paymentMethod: 'CREDIT_CARD',
            items: [],
            createdAt: '2026-10-01'
          }
        ]
      };

      service.getMyOrders().subscribe((res) => {
        expect(res.success).toBe(true);
        expect(res.data.length).toBe(1);
        expect(res.data[0].status).toBe('DELIVERED');
      });

      const req = httpTesting.expectOne(`${baseUrl}/my-orders`);
      expect(req.request.method).toBe('GET');

      req.flush(mockResponse);
    });
  });

  describe('getAllOrders', () => {
    it('should send a GET request with pagination query params to /all', () => {
      const mockResponse = {
        success: true,
        message: 'All orders',
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 10,
          number: 0
        }
      };

      service.getAllOrders(1, 20).subscribe((res) => {
        expect(res.success).toBe(true);
        expect(res.data.size).toBe(10);
      });

      const req = httpTesting.expectOne((request) => {
        return request.url === `${baseUrl}/all` &&
          request.params.get('page') === '1' &&
          request.params.get('size') === '20';
      });

      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getOrderById', () => {
    it('should send a GET request to /api/orders/:id', () => {
      const mockResponse: ApiResponse<Order> = {
        success: true,
        message: 'Order details',
        data: { id: 5, orderNumber: 'ORD-005' } as any
      };

      service.getOrderById(5).subscribe((res) => {
        expect(res.data.id).toBe(5);
      });

      const req = httpTesting.expectOne(`${baseUrl}/5`);
      expect(req.request.method).toBe('GET');

      req.flush(mockResponse);
    });
  });

  describe('updateOrderStatus', () => {
    it('should send a PUT request to /api/orders/:id/status with the new status', () => {
      const newStatus: OrderStatus = 'SHIPPED';
      const mockResponse: ApiResponse<Order> = {
        success: true,
        message: 'Order status updated',
        data: { id: 5, orderNumber: 'ORD-005', status: newStatus } as any
      };

      service.updateOrderStatus(5, newStatus).subscribe((res) => {
        expect(res.data.status).toBe('SHIPPED');
      });

      const req = httpTesting.expectOne(`${baseUrl}/5/status`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ status: 'SHIPPED' });

      req.flush(mockResponse);
    });
  });
});
