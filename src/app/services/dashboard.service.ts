import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { DashboardSummary } from '../models/dashboard.model';

import { API_BASE_URL } from '../core/api.config';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly API_URL = `${API_BASE_URL}/admin/dashboard`;

  getDashboardSummary(): Observable<ApiResponse<DashboardSummary>> {
    return this.http.get<ApiResponse<DashboardSummary>>(this.API_URL);
  }
}
