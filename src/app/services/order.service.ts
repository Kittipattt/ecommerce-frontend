import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Order, OrderCreateRequest, OrderStatus } from '../models/order.model';

export interface PaginatedOrders {
  content: Order[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/orders';

  createOrder(request: OrderCreateRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.API_URL, request);
  }

  getMyOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_URL}/my-orders`);
  }

  getAllOrders(page = 0, size = 10): Observable<ApiResponse<PaginatedOrders>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<PaginatedOrders>>(`${this.API_URL}/all`, { params });
  }

  getOrderById(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.API_URL}/${id}`);
  }

  updateOrderStatus(orderId: number, status: OrderStatus): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.API_URL}/${orderId}/status`, { status });
  }
}
