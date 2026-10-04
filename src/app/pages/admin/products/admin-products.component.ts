import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { NotificationService } from '../../../services/notification.service';
import { Category, Product, ProductRequest } from '../../../models/product.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="admin-page">
      <div class="admin-header">
        <div>
          <div class="breadcrumb">
            <a routerLink="/admin/dashboard">Admin</a> / <span>Inventory Management</span>
          </div>
          <h1 class="page-title">Manage Products</h1>
          <p class="page-subtitle">Add, edit, adjust pricing, and monitor catalog inventory levels</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add New Product
        </button>
      </div>

      <!-- Products Data Table Card -->
      <div class="card table-card">
        @if (isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading inventory items...</p>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (product of products(); track product.id) {
                  <tr>
                    <td>
                      <div class="product-cell">
                        <img [src]="product.imageUrl" [alt]="product.name" class="table-thumb" />
                        <div class="product-name-block">
                          <span class="p-title">{{ product.name }}</span>
                          <span class="p-id text-secondary">ID: #{{ product.id }}</span>
                        </div>
                      </div>
                    </td>
                    <td>{{ product.category.name }}</td>
                    <td><strong class="text-accent">\${{ product.price | number:'1.2-2' }}</strong></td>
                    <td>
                      <span class="stock-badge" [class.low-stock-text]="product.stockQuantity <= 5">
                        {{ product.stockQuantity }} units
                      </span>
                    </td>
                    <td>
                      @if (product.stockQuantity > 5) {
                        <span class="badge badge-success">In Stock</span>
                      } @else if (product.stockQuantity > 0) {
                        <span class="badge badge-warning">Low Stock</span>
                      } @else {
                        <span class="badge badge-danger">Sold Out</span>
                      }
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button class="btn btn-secondary btn-sm" (click)="openEditModal(product)">
                          Edit
                        </button>
                        <button class="btn btn-danger btn-sm" (click)="deleteProduct(product)">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Add / Edit Modal -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editingProductId() ? 'Edit Product' : 'Add New Product' }}</h2>
              <button class="close-btn" (click)="closeModal()">✕</button>
            </div>

            <form [formGroup]="productForm" (ngSubmit)="saveProduct()" class="modal-body">
              <div class="form-group">
                <label class="form-label">Product Name *</label>
                <input type="text" formControlName="name" class="form-control" placeholder="e.g. Sony WH-1000XM5" />
              </div>

              <div class="form-row">
                <div class="form-group col">
                  <label class="form-label">Category *</label>
                  <select formControlName="categoryId" class="form-control">
                    @for (cat of categories(); track cat.id) {
                      <option [value]="cat.id">{{ cat.name }}</option>
                    }
                  </select>
                </div>

                <div class="form-group col">
                  <label class="form-label">Price (\$) *</label>
                  <input type="number" step="0.01" formControlName="price" class="form-control" />
                </div>

                <div class="form-group col">
                  <label class="form-label">Stock Quantity *</label>
                  <input type="number" formControlName="stockQuantity" class="form-control" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Image URL *</label>
                <input type="text" formControlName="imageUrl" class="form-control" placeholder="https://..." />
              </div>

              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea rows="3" formControlName="description" class="form-control" placeholder="Specs and features..."></textarea>
              </div>

              <div class="form-group form-check">
                <label class="check-label">
                  <input type="checkbox" formControlName="featured" />
                  <span>Featured Product (Display in Hero / Highlights)</span>
                </label>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="productForm.invalid">
                  {{ editingProductId() ? 'Save Changes' : 'Create Product' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
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
    .table-card {
      padding: 0;
      overflow: hidden;
    }
    .product-cell {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .table-thumb {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
    }
    .product-name-block {
      display: flex;
      flex-direction: column;
    }
    .p-title {
      font-weight: 600;
    }
    .p-id {
      font-size: 0.75rem;
    }
    .stock-badge {
      font-weight: 600;
    }
    .low-stock-text {
      color: #fca5a5;
    }
    .action-buttons {
      display: flex;
      gap: 8px;
    }
    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .close-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 1.25rem;
      cursor: pointer;
    }
    .modal-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .form-row .col {
      flex: 1;
    }
    .check-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 12px;
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
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminProductsComponent implements OnInit {
  productService = inject(ProductService);
  notification = inject(NotificationService);
  fb = inject(FormBuilder);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal<boolean>(true);
  showModal = signal<boolean>(false);
  editingProductId = signal<number | null>(null);

  productForm!: FormGroup;

  ngOnInit() {
    this.initForm();
    this.loadCategories();
    this.loadProducts();
  }

  initForm() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      categoryId: [1, [Validators.required]],
      imageUrl: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800', [Validators.required]],
      featured: [false]
    });
  }

  loadCategories() {
    this.productService.getCategories().subscribe({
      next: (res) => {
        if (res.success) this.categories.set(res.data);
      }
    });
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getProducts(undefined, undefined, 0, 50).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.products.set(res.data.content);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  openCreateModal() {
    this.editingProductId.set(null);
    this.productForm.reset({
      name: '',
      description: '',
      price: 99.00,
      stockQuantity: 20,
      categoryId: this.categories()[0]?.id || 1,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
      featured: false
    });
    this.showModal.set(true);
  }

  openEditModal(product: Product) {
    this.editingProductId.set(product.id);
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.category?.id || 1,
      imageUrl: product.imageUrl,
      featured: product.featured
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingProductId.set(null);
  }

  saveProduct() {
    if (this.productForm.invalid) return;

    const request: ProductRequest = this.productForm.value;
    const editId = this.editingProductId();

    if (editId) {
      this.productService.updateProduct(editId, request).subscribe({
        next: (res) => {
          if (res.success) {
            this.notification.success('Product updated successfully');
            this.closeModal();
            this.loadProducts();
          }
        },
        error: (err) => this.notification.error(err.error?.message || 'Update failed')
      });
    } else {
      this.productService.createProduct(request).subscribe({
        next: (res) => {
          if (res.success) {
            this.notification.success('New product created successfully');
            this.closeModal();
            this.loadProducts();
          }
        },
        error: (err) => this.notification.error(err.error?.message || 'Creation failed')
      });
    }
  }

  deleteProduct(product: Product) {
    if (!confirm(`Are you sure you want to remove "${product.name}"?`)) return;

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.notification.success('Product deleted');
        this.loadProducts();
      },
      error: (err) => this.notification.error(err.error?.message || 'Delete failed')
    });
  }
}
