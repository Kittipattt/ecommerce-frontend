import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Category, Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-6 pb-20 w-full">
      <!-- Hero Section -->
      <section class="relative py-16 sm:py-24 flex flex-col items-center text-center overflow-hidden">
        <div class="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-r from-indigo-500/25 via-cyan-500/15 to-transparent blur-3xl pointer-events-none -z-10 rounded-full"></div>
        <div class="relative z-10 max-w-3xl flex flex-col items-center gap-5">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/15 border border-indigo-500/30 rounded-full text-xs font-semibold text-indigo-300">
            <span class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
            Next-Generation Tech Gear 2026
          </div>
          <h1 class="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Elevate Your Setup with <span class="bg-gradient-to-r from-indigo-400 via-sky-300 to-cyan-400 bg-clip-text text-transparent">Precision Hardware</span>
          </h1>
          <p class="text-base sm:text-lg text-gray-400 leading-relaxed max-w-2xl">
            Curated premium workspace essentials, audiophile headsets, and ultra-responsive mechanical gear engineered for maximum performance.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4 mt-2">
            <a href="#catalog" class="btn btn-primary shadow-lg shadow-indigo-500/25">
              Browse Collection
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </a>
            <button class="btn btn-secondary" (click)="filterFeatured()">
              Featured Releases
            </button>
          </div>
        </div>
      </section>

      <!-- Catalog Section -->
      <section id="catalog" class="pt-8">
        <div class="flex flex-wrap justify-between items-end gap-5 mb-8">
          <div>
            <h2 class="font-heading text-2xl sm:text-3xl font-bold text-white">Product Catalog</h2>
            <p class="text-sm text-gray-400 mt-1">Discover high-performance gear backed by our 2-year warranty</p>
          </div>

          <!-- Controls: Search & Sort -->
          <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div class="relative flex-1 sm:w-72">
              <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                class="form-control pl-10 pr-8"
                placeholder="Search products or specs..."
                [(ngModel)]="searchTerm"
                (ngModelChange)="onSearchChange()"
              />
              @if (searchTerm) {
                <button class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer" (click)="clearSearch()">✕</button>
              }
            </div>

            <select class="form-control sm:w-48 cursor-pointer" [(ngModel)]="sortBy" (ngModelChange)="loadProducts()">
              <option value="id-desc">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rated</option>
            </select>
          </div>
        </div>

        <!-- Category Pills -->
        <div class="flex items-center gap-2.5 overflow-x-auto pb-4 mb-8">
          <button
            class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
            [ngClass]="selectedCategoryId() === null ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-gray-800/80 hover:bg-gray-700 text-gray-300 border border-gray-700/50'"
            (click)="selectCategory(null)">
            All Products
          </button>
          @for (cat of categories(); track cat.id) {
            <button
              class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
              [ngClass]="selectedCategoryId() === cat.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-gray-800/80 hover:bg-gray-700 text-gray-300 border border-gray-700/50'"
              (click)="selectCategory(cat.id)">
              {{ cat.name }}
            </button>
          }
        </div>

        <!-- Product Grid -->
        @if (isLoading()) {
          <div class="flex flex-col items-center gap-4 py-20 text-gray-400">
            <div class="w-10 h-10 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p class="text-sm">Loading products from backend...</p>
          </div>
        } @else if (products().length === 0) {
          <div class="p-12 rounded-2xl bg-gray-900 border border-gray-800 text-center flex flex-col items-center gap-3">
            <p class="text-gray-400">No products found matching your criteria.</p>
            <button class="btn btn-outline btn-sm" (click)="resetFilters()">Reset Filters</button>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (product of products(); track product.id) {
              <div
                class="group relative rounded-2xl bg-gray-900 border border-gray-800 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
                (click)="openDetail(product)">
                <div class="relative aspect-[4/3] bg-gray-800/60 overflow-hidden">
                  <img [src]="product.imageUrl" [alt]="product.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  @if (product.featured) {
                    <span class="badge badge-primary absolute top-3 left-3 shadow">Featured</span>
                  }
                  @if (product.stockQuantity <= 5 && product.stockQuantity > 0) {
                    <span class="badge badge-warning absolute top-3 right-3 shadow">Low Stock: {{ product.stockQuantity }}</span>
                  } @else if (product.stockQuantity === 0) {
                    <span class="badge badge-danger absolute top-3 right-3 shadow">Out of Stock</span>
                  }
                </div>

                <div class="p-5 flex-1 flex flex-col">
                  <span class="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-1">{{ product.category.name }}</span>
                  <h3 class="font-heading font-bold text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1.5">{{ product.name }}</h3>
                  <p class="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4 flex-1">{{ product.description }}</p>

                  <div class="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                    <span class="text-amber-400 font-bold">★ {{ product.rating }}</span>
                    <span>({{ product.reviewsCount }} reviews)</span>
                  </div>

                  <div class="flex items-center justify-between pt-3 border-t border-gray-800/80 mt-auto">
                    <div class="font-heading font-extrabold text-lg text-cyan-400 font-mono">
                      \${{ product.price | number:'1.2-2' }}
                    </div>
                    <button
                      class="btn btn-primary btn-sm"
                      [disabled]="product.stockQuantity <= 0"
                      (click)="addToCart($event, product)">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                      </svg>
                      {{ product.stockQuantity > 0 ? 'Add' : 'Sold Out' }}
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </section>

      <!-- Quick Product Detail Modal -->
      @if (selectedProduct(); as p) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4 sm:p-6 animate-in fade-in duration-200" (click)="closeDetail()">
          <div class="relative bg-gray-900 border border-gray-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 p-6 sm:p-8" (click)="$event.stopPropagation()">
            <button class="absolute top-5 right-5 text-gray-400 hover:text-white p-2 text-lg rounded-xl hover:bg-gray-800 transition-colors cursor-pointer z-10" (click)="closeDetail()">✕</button>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div class="aspect-square rounded-2xl overflow-hidden bg-gray-800 border border-gray-700/60">
                <img [src]="p.imageUrl" [alt]="p.name" class="w-full h-full object-cover" />
              </div>
              <div class="space-y-4">
                <div class="badge badge-info">{{ p.category.name }}</div>
                <h2 class="font-heading text-2xl font-bold text-white leading-snug">{{ p.name }}</h2>
                <div class="flex items-center gap-1.5 text-xs text-gray-400">
                  <span class="text-amber-400 font-bold">★ {{ p.rating }}</span>
                  <span>({{ p.reviewsCount }} verified customer reviews)</span>
                </div>
                <div class="font-heading font-extrabold text-3xl text-cyan-400 font-mono">\${{ p.price | number:'1.2-2' }}</div>
                <p class="text-sm text-gray-400 leading-relaxed">{{ p.description }}</p>

                <div class="pt-1">
                  @if (p.stockQuantity > 5) {
                    <span class="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">● In Stock ({{ p.stockQuantity }} units available)</span>
                  } @else if (p.stockQuantity > 0) {
                    <span class="text-xs font-semibold text-amber-400 flex items-center gap-1.5">● Low Stock (Only {{ p.stockQuantity }} left)</span>
                  } @else {
                    <span class="text-xs font-semibold text-red-400 flex items-center gap-1.5">● Currently Out of Stock</span>
                  }
                </div>

                <div class="flex flex-col sm:flex-row gap-3 pt-3">
                  <div class="flex items-center gap-2 bg-gray-800/80 border border-gray-700/60 rounded-xl px-2 py-1 shrink-0 justify-center">
                    <button class="w-7 h-7 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 flex items-center justify-center font-bold text-xs cursor-pointer" (click)="decreaseModalQty()">-</button>
                    <span class="font-mono font-bold text-sm text-gray-200 px-2">{{ modalQuantity() }}</span>
                    <button class="w-7 h-7 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 flex items-center justify-center font-bold text-xs cursor-pointer" (click)="increaseModalQty(p.stockQuantity)">+</button>
                  </div>

                  <button
                    class="btn btn-primary flex-1 py-3 text-sm font-heading font-bold tracking-wide shadow-lg shadow-indigo-500/25"
                    [disabled]="p.stockQuantity <= 0"
                    (click)="addModalProductToCart(p)">
                    Add to Cart • \${{ (p.price * modalQuantity()) | number:'1.2-2' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class HomeComponent implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);

  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);
  selectedCategoryId = signal<number | null>(null);
  selectedProduct = signal<Product | null>(null);
  modalQuantity = signal<number>(1);
  isLoading = signal<boolean>(true);

  searchTerm = '';
  sortBy = 'id-desc';

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.productService.getCategories().subscribe({
      next: (res) => {
        if (res.success) {
          this.categories.set(res.data);
        }
      }
    });
  }

  loadProducts() {
    this.isLoading.set(true);
    const [sortField, sortDir] = this.sortBy.split('-');

    this.productService.getProducts(
      this.selectedCategoryId() ?? undefined,
      this.searchTerm,
      0,
      20,
      sortField,
      sortDir
    ).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.products.set(res.data.content);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  selectCategory(id: number | null) {
    this.selectedCategoryId.set(id);
    this.loadProducts();
  }

  onSearchChange() {
    this.loadProducts();
  }

  clearSearch() {
    this.searchTerm = '';
    this.loadProducts();
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedCategoryId.set(null);
    this.sortBy = 'id-desc';
    this.loadProducts();
  }

  filterFeatured() {
    this.isLoading.set(true);
    this.productService.getFeaturedProducts().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.products.set(res.data);
          this.selectedCategoryId.set(null);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  openDetail(product: Product) {
    this.selectedProduct.set(product);
    this.modalQuantity.set(1);
  }

  closeDetail() {
    this.selectedProduct.set(null);
  }

  increaseModalQty(maxStock: number) {
    if (this.modalQuantity() < maxStock) {
      this.modalQuantity.update(q => q + 1);
    }
  }

  decreaseModalQty() {
    if (this.modalQuantity() > 1) {
      this.modalQuantity.update(q => q - 1);
    }
  }

  addModalProductToCart(product: Product) {
    this.cartService.addToCart(product, this.modalQuantity());
    this.closeDetail();
  }

  addToCart(event: Event, product: Product) {
    event.stopPropagation();
    this.cartService.addToCart(product, 1);
  }
}
