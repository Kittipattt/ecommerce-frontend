import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Category, PaginatedProducts, Product, ProductRequest } from '../models/product.model';

import { API_BASE_URL } from '../core/api.config';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly API_URL = `${API_BASE_URL}/products`;
  private readonly CAT_URL = `${API_BASE_URL}/categories`;

  getProducts(categoryId?: number, search?: string, page = 0, size = 12, sortBy = 'id', sortDirection = 'desc'): Observable<ApiResponse<PaginatedProducts>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (categoryId) {
      params = params.set('categoryId', categoryId.toString());
    }
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<ApiResponse<PaginatedProducts>>(this.API_URL, { params });
  }

  getFeaturedProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.API_URL}/featured`);
  }

  getProductById(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.API_URL}/${id}`);
  }

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(this.CAT_URL);
  }

  createProduct(request: ProductRequest): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this.API_URL, request);
  }

  updateProduct(id: number, request: ProductRequest): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.API_URL}/${id}`, request);
  }

  deleteProduct(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }
}
