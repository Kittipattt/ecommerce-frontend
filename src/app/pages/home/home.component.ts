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
    <div class="home-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-bg-glow"></div>
        <div class="hero-content">
          <div class="hero-badge">
            <span class="pulse-dot"></span> Next-Generation Tech Gear 2026
          </div>
          <h1 class="hero-title">
            Elevate Your Setup with <span class="gradient-text">Precision Hardware</span>
          </h1>
          <p class="hero-subtitle">
            Curated premium workspace essentials, audiophile headsets, and ultra-responsive mechanical gear engineered for maximum performance.
          </p>
          <div class="hero-actions">
            <a href="#catalog" class="btn btn-primary">
              Browse Collection
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </a>
            <button class="btn btn-secondary" (click)="filterFeatured()">
              Featured Releases
            </button>
          </div>
        </div>
      </section>

      <!-- Catalog Section -->
      <section id="catalog" class="catalog-section">
        <div class="catalog-header">
          <div>
            <h2 class="section-title">Product Catalog</h2>
            <p class="section-subtitle">Discover high-performance gear backed by our 2-year warranty</p>
          </div>

          <!-- Controls: Search & Sort -->
          <div class="catalog-controls">
            <div class="search-input-wrapper">
              <svg class="search-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                class="form-control search-input"
                placeholder="Search products or specs..."
                [(ngModel)]="searchTerm"
                (ngModelChange)="onSearchChange()"
              />
              @if (searchTerm) {
                <button class="clear-search-btn" (click)="clearSearch()">✕</button>
              }
            </div>

            <select class="form-control sort-select" [(ngModel)]="sortBy" (ngModelChange)="loadProducts()">
              <option value="id-desc">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rated</option>
            </select>
          </div>
        </div>

        <!-- Category Pills -->
        <div class="category-pills">
          <button
            class="cat-pill"
            [class.active]="selectedCategoryId() === null"
            (click)="selectCategory(null)">
            All Products
          </button>
          @for (cat of categories(); track cat.id) {
            <button
              class="cat-pill"
              [class.active]="selectedCategoryId() === cat.id"
              (click)="selectCategory(cat.id)">
              {{ cat.name }}
            </button>
          }
        </div>

        <!-- Product Grid -->
        @if (isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading products from backend...</p>
          </div>
        } @else if (products().length === 0) {
          <div class="empty-state card">
            <p>No products found matching your criteria.</p>
            <button class="btn btn-outline btn-sm" (click)="resetFilters()">Reset Filters</button>
          </div>
        } @else {
          <div class="product-grid">
            @for (product of products(); track product.id) {
              <div class="card card-interactive product-card" (click)="openDetail(product)">
                <div class="product-image-box">
                  <img [src]="product.imageUrl" [alt]="product.name" class="product-img" loading="lazy" />
                  @if (product.featured) {
                    <span class="badge badge-primary badge-pos">Featured</span>
                  }
                  @if (product.stockQuantity <= 5 && product.stockQuantity > 0) {
                    <span class="badge badge-warning badge-pos-right">Low Stock: {{ product.stockQuantity }}</span>
                  } @else if (product.stockQuantity === 0) {
                    <span class="badge badge-danger badge-pos-right">Out of Stock</span>
                  }
                </div>

                <div class="product-info">
                  <span class="product-cat">{{ product.category.name }}</span>
                  <h3 class="product-name">{{ product.name }}</h3>
                  <p class="product-desc">{{ product.description }}</p>

                  <div class="product-rating">
                    <span class="stars">★ {{ product.rating }}</span>
                    <span class="reviews">({{ product.reviewsCount }} reviews)</span>
                  </div>

                  <div class="product-footer">
                    <div class="product-price">
                      <span class="currency">\$</span>{{ product.price | number:'1.2-2' }}
                    </div>
                    <button
                      class="btn btn-primary btn-sm btn-add"
                      [disabled]="product.stockQuantity <= 0"
                      (click)="addToCart($event, product)">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div class="modal-overlay" (click)="closeDetail()">
          <div class="modal-content modal-detail" (click)="$event.stopPropagation()">
            <button class="modal-close-btn" (click)="closeDetail()">✕</button>
            <div class="modal-detail-grid">
              <div class="modal-image-col">
                <img [src]="p.imageUrl" [alt]="p.name" class="modal-product-img" />
              </div>
              <div class="modal-info-col">
                <div class="badge badge-info">{{ p.category.name }}</div>
                <h2 class="modal-title">{{ p.name }}</h2>
                <div class="product-rating">
                  <span class="stars">★ {{ p.rating }}</span>
                  <span class="reviews">({{ p.reviewsCount }} verified customer reviews)</span>
                </div>
                <div class="modal-price">\${{ p.price | number:'1.2-2' }}</div>
                <p class="modal-desc">{{ p.description }}</p>

                <div class="modal-stock-status">
                  @if (p.stockQuantity > 5) {
                    <span class="stock-indicator in-stock">● In Stock ({{ p.stockQuantity }} units available)</span>
                  } @else if (p.stockQuantity > 0) {
                    <span class="stock-indicator low-stock">● Low Stock (Only {{ p.stockQuantity }} left)</span>
                  } @else {
                    <span class="stock-indicator out-stock">● Currently Out of Stock</span>
                  }
                </div>

                <div class="modal-actions">
                  <div class="modal-qty">
                    <label class="form-label">Quantity</label>
                    <div class="qty-control">
                      <button class="qty-btn" (click)="decreaseModalQty()">-</button>
                      <span class="qty-val">{{ modalQuantity() }}</span>
                      <button class="qty-btn" (click)="increaseModalQty(p.stockQuantity)">+</button>
                    </div>
                  </div>

                  <button
                    class="btn btn-primary modal-add-btn"
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
  `,
  styles: [`
    .home-page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 24px 80px 24px;
      width: 100%;
    }
    /* Hero */
    .hero-section {
      position: relative;
      padding: 70px 0 60px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      overflow: hidden;
    }
    .hero-bg-glow {
      position: absolute;
      top: -20%;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      height: 350px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.1) 50%, transparent 70%);
      filter: blur(50px);
      pointer-events: none;
      z-index: 0;
    }
    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 780px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      background: rgba(79, 70, 229, 0.15);
      border: 1px solid rgba(79, 70, 229, 0.35);
      border-radius: var(--radius-full);
      font-size: 0.85rem;
      font-weight: 600;
      color: #a5b4fc;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
    }
    .hero-title {
      font-size: 3.25rem;
      line-height: 1.15;
      font-weight: 800;
    }
    .gradient-text {
      background: linear-gradient(135deg, #818cf8 0%, #38bdf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-subtitle {
      font-size: 1.15rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }
    .hero-actions {
      display: flex;
      gap: 16px;
      margin-top: 10px;
    }

    /* Catalog Section */
    .catalog-section {
      margin-top: 40px;
    }
    .catalog-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 1.85rem;
      font-weight: 700;
    }
    .section-subtitle {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin-top: 4px;
    }
    .catalog-controls {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .search-input-wrapper {
      position: relative;
      min-width: 260px;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }
    .search-input {
      padding-left: 40px;
      padding-right: 36px;
    }
    .clear-search-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
    }
    .sort-select {
      width: auto;
      min-width: 180px;
      cursor: pointer;
    }

    /* Category Pills */
    .category-pills {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 12px;
      margin-bottom: 28px;
    }
    .cat-pill {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      font-family: var(--font-heading);
      font-size: 0.9rem;
      font-weight: 600;
      padding: 8px 18px;
      border-radius: var(--radius-full);
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--transition-fast);
    }
    .cat-pill:hover {
      border-color: var(--primary);
      color: var(--text-main);
    }
    .cat-pill.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #ffffff;
      box-shadow: 0 4px 12px var(--primary-glow);
    }

    /* Product Grid */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }
    .product-card {
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
      cursor: pointer;
    }
    .product-image-box {
      position: relative;
      height: 220px;
      background: #1e293b;
      overflow: hidden;
    }
    .product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .product-card:hover .product-img {
      transform: scale(1.05);
    }
    .badge-pos {
      position: absolute;
      top: 12px;
      left: 12px;
    }
    .badge-pos-right {
      position: absolute;
      top: 12px;
      right: 12px;
    }
    .product-info {
      padding: 20px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .product-cat {
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--accent);
      margin-bottom: 6px;
    }
    .product-name {
      font-size: 1.05rem;
      font-weight: 700;
      line-height: 1.35;
      margin-bottom: 8px;
    }
    .product-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 14px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .product-rating {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      margin-bottom: 16px;
    }
    .stars {
      color: #fbbf24;
      font-weight: 700;
    }
    .reviews {
      color: var(--text-muted);
    }
    .product-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 14px;
      border-top: 1px solid var(--border);
    }
    .product-price {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 800;
      color: #fff;
    }
    .currency {
      color: #818cf8;
      font-size: 0.9rem;
      margin-right: 2px;
    }
    .btn-add {
      padding: 6px 14px;
    }

    /* Loading and Empty States */
    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 0;
      gap: 16px;
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
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Modal Detail */
    .modal-detail {
      max-width: 800px;
      padding: 32px;
      position: relative;
    }
    .modal-close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      border-radius: 50%;
      width: 32px;
      height: 32px;
      cursor: pointer;
    }
    .modal-detail-grid {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 28px;
    }
    .modal-product-img {
      width: 100%;
      height: 340px;
      object-fit: cover;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
    }
    .modal-info-col {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .modal-title {
      font-size: 1.5rem;
      line-height: 1.25;
    }
    .modal-price {
      font-family: var(--font-heading);
      font-size: 1.85rem;
      font-weight: 800;
      color: #818cf8;
    }
    .modal-desc {
      font-size: 0.925rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }
    .stock-indicator {
      font-size: 0.85rem;
      font-weight: 600;
    }
    .in-stock { color: var(--success); }
    .low-stock { color: var(--warning); }
    .out-stock { color: var(--danger); }
    .modal-actions {
      margin-top: auto;
      display: flex;
      gap: 16px;
      align-items: flex-end;
    }
    .qty-control {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .qty-btn {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--bg-surface-elevated);
      color: var(--text-main);
      cursor: pointer;
    }
    .modal-add-btn {
      flex: 1;
      padding: 12px;
    }
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.25rem;
      }
      .modal-detail-grid {
        grid-template-columns: 1fr;
      }
      .modal-product-img {
        height: 220px;
      }
    }
  `]
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
