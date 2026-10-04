export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: Category;
  imageUrl: string;
  featured: boolean;
  rating: number;
  reviewsCount: number;
  createdAt: string;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  imageUrl: string;
  featured: boolean;
}

export interface PaginatedProducts {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
