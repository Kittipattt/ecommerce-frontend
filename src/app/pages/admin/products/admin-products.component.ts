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
    <div class="max-w-7xl mx-auto px-6 py-10 w-full">
      <!-- Admin Header -->
      <div class="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <div class="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
            <a routerLink="/admin/dashboard" class="text-indigo-400 hover:text-indigo-300">Admin</a>
            <span>/</span>
            <span>Inventory Management</span>
          </div>
          <h1 class="font-heading text-3xl font-extrabold text-white">Manage Products</h1>
          <p class="text-sm text-gray-400 mt-1">Add, edit, adjust pricing, and monitor catalog inventory levels</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add New Product
        </button>
      </div>

      <!-- Products Data Table Card -->
      <div class="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden shadow-xl">
        @if (isLoading()) {
          <div class="flex flex-col items-center gap-4 py-20 text-gray-400">
            <div class="w-10 h-10 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p class="text-sm">Loading inventory items...</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-300">
              <thead class="bg-gray-800/80 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-800">
                <tr>
                  <th class="px-5 py-4 font-semibold">Product</th>
                  <th class="px-5 py-4 font-semibold">Category</th>
                  <th class="px-5 py-4 font-semibold">Price</th>
                  <th class="px-5 py-4 font-semibold">Stock Quantity</th>
                  <th class="px-5 py-4 font-semibold">Status</th>
                  <th class="px-5 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-800/60">
                @for (product of products(); track product.id) {
                  <tr class="hover:bg-gray-800/30 transition-colors">
                    <td class="px-5 py-4">
                      <div class="flex items-center gap-3.5">
                        <img [src]="product.imageUrl" [alt]="product.name" class="w-12 h-12 rounded-xl object-cover bg-gray-800 border border-gray-700/60 shrink-0" />
                        <div>
                          <span class="font-semibold text-gray-200 block">{{ product.name }}</span>
                          <span class="text-xs text-gray-400 font-mono">ID: #{{ product.id }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="px-5 py-4 text-gray-300">{{ product.category.name }}</td>
                    <td class="px-5 py-4 font-mono font-bold text-cyan-400">\${{ product.price | number:'1.2-2' }}</td>
                    <td class="px-5 py-4">
                      <span class="font-mono text-xs font-semibold" [ngClass]="product.stockQuantity <= 5 ? 'text-red-400 font-bold' : 'text-gray-300'">
                        {{ product.stockQuantity }} units
                      </span>
                    </td>
                    <td class="px-5 py-4">
                      @if (product.stockQuantity > 5) {
                        <span class="badge badge-success">In Stock</span>
                      } @else if (product.stockQuantity > 0) {
                        <span class="badge badge-warning">Low Stock</span>
                      } @else {
                        <span class="badge badge-danger">Sold Out</span>
                      }
                    </td>
                    <td class="px-5 py-4 text-right">
                      <div class="inline-flex gap-2">
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
        <div class="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200" (click)="closeModal()">
          <div class="bg-gray-900 border border-gray-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200" (click)="$event.stopPropagation()">
            <div class="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 class="font-heading text-xl font-bold text-white">{{ editingProductId() ? 'Edit Product' : 'Add New Product' }}</h2>
              <button class="text-gray-400 hover:text-white p-1 text-base rounded-lg transition-colors cursor-pointer" (click)="closeModal()">✕</button>
            </div>

            <form [formGroup]="productForm" (ngSubmit)="saveProduct()" class="p-6 space-y-4">
              <div>
                <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Product Name *</label>
                <input type="text" formControlName="name" class="form-control" placeholder="e.g. Sony WH-1000XM5" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Category *</label>
                  <select formControlName="categoryId" class="form-control cursor-pointer">
                    @for (cat of categories(); track cat.id) {
                      <option [value]="cat.id">{{ cat.name }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Price (\$) *</label>
                  <input type="number" step="0.01" formControlName="price" class="form-control" />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Stock Quantity *</label>
                  <input type="number" formControlName="stockQuantity" class="form-control" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Image URL *</label>
                <input type="text" formControlName="imageUrl" class="form-control" placeholder="https://..." />
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Description</label>
                <textarea rows="3" formControlName="description" class="form-control" placeholder="Specs and features..."></textarea>
              </div>

              <div class="pt-1">
                <label class="flex items-center gap-2.5 cursor-pointer text-sm text-gray-300">
                  <input type="checkbox" formControlName="featured" class="w-4 h-4 accent-indigo-500 rounded" />
                  <span>Featured Product (Display in Hero / Highlights)</span>
                </label>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t border-gray-800">
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
  `
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

  productForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    categoryId: [1, [Validators.required]],
    imageUrl: ['', [Validators.required]],
    featured: [false]
  });

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.productService.getCategories().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.categories.set(res.data);
        }
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
