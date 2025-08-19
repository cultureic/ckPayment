// Product Management Types

export interface Product {
  product_id: string;
  name: string;
  description: string;
  price: bigint;
  token_symbol: string;
  category?: string;
  image_url?: string;
  status: ProductStatus;
  inventory_count?: number;
  metadata: [string, string][];
  created_at: bigint;
  updated_at: bigint;
}

export interface ProductSalesStats {
  product_id: string;
  total_sales: bigint;
  total_revenue: bigint;
  units_sold: number;
  last_sale_at?: bigint;
}

export type ProductStatus = 'Active' | 'Inactive' | 'OutOfStock';

export interface CreateProductForm {
  name: string;
  description: string;
  price: number; // In UI, we use number and convert to bigint
  token_symbol: string;
  category?: string;
  image_url?: string;
  inventory_count?: number;
  metadata: [string, string][];
}

export interface UpdateProductForm extends CreateProductForm {
  status: ProductStatus;
}

// Display types (converted from canister types)
export interface ProductDisplay {
  product_id: string;
  name: string;
  description: string;
  price: number; // Converted from bigint for display
  token_symbol: string;
  category?: string;
  image_url?: string;
  status: ProductStatus;
  inventory_count?: number;
  metadata: [string, string][];
  created_at: Date;
  updated_at: Date;
  // Additional computed fields
  formatted_price: string;
  is_unlimited_inventory: boolean;
  is_available: boolean;
}

export interface ProductSalesStatsDisplay {
  product_id: string;
  total_sales: number; // Converted from bigint
  total_revenue: number; // Converted from bigint
  units_sold: number;
  last_sale_at?: Date;
  // Additional computed fields
  formatted_revenue: string;
  average_sale_value: number;
  formatted_average_sale_value: string;
}

// Filter and search types
export interface ProductFilters {
  status?: ProductStatus[];
  categories?: string[];
  tokens?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  inventory?: {
    includeUnlimited: boolean;
    includeOutOfStock: boolean;
  };
  search?: string;
}

export interface ProductSortOptions {
  field: 'name' | 'price' | 'created_at' | 'updated_at' | 'total_sales' | 'inventory_count';
  direction: 'asc' | 'desc';
}

// Component props types
export interface ProductCardProps {
  product: ProductDisplay;
  onEdit?: (product: ProductDisplay) => void;
  onDelete?: (productId: string) => void;
  onToggleStatus?: (productId: string) => void;
  onUpdateInventory?: (productId: string, inventory?: number) => void;
  showActions?: boolean;
  loading?: boolean;
}

export interface ProductFormProps {
  product?: ProductDisplay | null;
  supportedTokens: string[];
  categories: string[];
  onSubmit: (formData: CreateProductForm) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  loading?: boolean;
}

export interface ProductTableProps {
  products: ProductDisplay[];
  loading?: boolean;
  error?: boolean;
  onEdit?: (product: ProductDisplay) => void;
  onDelete?: (productId: string) => void;
  onToggleStatus?: (productId: string) => void;
  onUpdateInventory?: (productId: string, inventory?: number) => void;
  filters?: ProductFilters;
  onFiltersChange?: (filters: ProductFilters) => void;
  sortOptions?: ProductSortOptions;
  onSortChange?: (sort: ProductSortOptions) => void;
}

export interface ProductAnalyticsProps {
  salesStats: ProductSalesStatsDisplay[];
  loading?: boolean;
  error?: boolean;
  onRefresh?: () => void;
}

// API response types
export interface ProductOperationResult {
  success: boolean;
  error?: string;
  data?: any;
}

// Constants
export const PRODUCT_STATUSES: ProductStatus[] = ['Active', 'Inactive', 'OutOfStock'];

export const DEFAULT_PRODUCT_CATEGORIES = [
  'General',
  'Digital',
  'Physical',
  'Subscription',
  'Service',
  'Course',
  'Software',
  'E-book',
  'Video',
  'Audio',
  'Template',
  'Tool',
  'Plugin',
  'Theme',
  'App'
];

export const PRODUCT_SORT_FIELDS = [
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'updated_at', label: 'Updated Date' },
  { value: 'total_sales', label: 'Total Sales' },
  { value: 'inventory_count', label: 'Inventory' }
] as const;

// Utility functions for type conversions
export const convertProductFromCanister = (canisterProduct: Product): ProductDisplay => {
  const created_at = new Date(Number(canisterProduct.created_at) / 1_000_000); // Convert nanoseconds to milliseconds
  const updated_at = new Date(Number(canisterProduct.updated_at) / 1_000_000);
  const price = Number(canisterProduct.price);
  
  return {
    product_id: canisterProduct.product_id,
    name: canisterProduct.name,
    description: canisterProduct.description,
    price,
    token_symbol: canisterProduct.token_symbol,
    category: canisterProduct.category,
    image_url: canisterProduct.image_url,
    status: mapProductStatus(canisterProduct.status),
    inventory_count: canisterProduct.inventory_count,
    metadata: canisterProduct.metadata,
    created_at,
    updated_at,
    formatted_price: formatPrice(price, canisterProduct.token_symbol),
    is_unlimited_inventory: canisterProduct.inventory_count === undefined,
    is_available: isProductAvailable(canisterProduct.status, canisterProduct.inventory_count)
  };
};

export const convertProductSalesStatsFromCanister = (canisterStats: ProductSalesStats): ProductSalesStatsDisplay => {
  const total_sales = Number(canisterStats.total_sales);
  const total_revenue = Number(canisterStats.total_revenue);
  const units_sold = canisterStats.units_sold;
  
  const average_sale_value = units_sold > 0 ? total_revenue / units_sold : 0;
  
  return {
    product_id: canisterStats.product_id,
    total_sales,
    total_revenue,
    units_sold,
    last_sale_at: canisterStats.last_sale_at ? new Date(Number(canisterStats.last_sale_at) / 1_000_000) : undefined,
    formatted_revenue: formatPrice(total_revenue, 'ICP'), // Default to ICP, should get token from product
    average_sale_value,
    formatted_average_sale_value: formatPrice(average_sale_value, 'ICP')
  };
};

export const convertProductToCanister = (formData: CreateProductForm): Omit<Product, 'product_id' | 'status' | 'created_at' | 'updated_at'> => {
  return {
    name: formData.name,
    description: formData.description,
    price: BigInt(Math.floor(formData.price * Math.pow(10, 8))), // Convert to e8s format (8 decimals)
    token_symbol: formData.token_symbol,
    category: formData.category,
    image_url: formData.image_url,
    inventory_count: formData.inventory_count,
    metadata: formData.metadata
  };
};

// Helper functions
const mapProductStatus = (status: any): ProductStatus => {
  if (typeof status === 'object') {
    if ('Active' in status) return 'Active';
    if ('Inactive' in status) return 'Inactive';
    if ('OutOfStock' in status) return 'OutOfStock';
  }
  return 'Inactive'; // Default fallback
};

const formatPrice = (price: number, token: string): string => {
  // Handle different token decimal places
  const decimals = getTokenDecimals(token);
  const formattedPrice = (price / Math.pow(10, decimals)).toFixed(decimals);
  return `${formattedPrice} ${token}`;
};

const getTokenDecimals = (token: string): number => {
  switch (token.toLowerCase()) {
    case 'icp':
      return 8;
    case 'ckbtc':
      return 8;
    case 'cketh':
      return 18;
    default:
      return 8; // Default to 8 decimals
  }
};

const isProductAvailable = (status: any, inventory?: number): boolean => {
  const productStatus = mapProductStatus(status);
  if (productStatus !== 'Active') return false;
  if (inventory !== undefined && inventory <= 0) return false;
  return true;
};

// Form validation
export interface ProductFormErrors {
  name?: string;
  description?: string;
  price?: string;
  token_symbol?: string;
  category?: string;
  image_url?: string;
  inventory_count?: string;
  metadata?: string;
}

export const validateProductForm = (formData: CreateProductForm): ProductFormErrors => {
  const errors: ProductFormErrors = {};
  
  if (!formData.name || formData.name.trim().length === 0) {
    errors.name = 'Product name is required';
  } else if (formData.name.length > 100) {
    errors.name = 'Product name must be less than 100 characters';
  }
  
  if (!formData.description || formData.description.trim().length === 0) {
    errors.description = 'Product description is required';
  } else if (formData.description.length > 500) {
    errors.description = 'Product description must be less than 500 characters';
  }
  
  if (!formData.price || formData.price <= 0) {
    errors.price = 'Price must be greater than 0';
  } else if (formData.price > 1000000) {
    errors.price = 'Price is too high';
  }
  
  if (!formData.token_symbol || formData.token_symbol.trim().length === 0) {
    errors.token_symbol = 'Token symbol is required';
  }
  
  if (formData.category && formData.category.length > 50) {
    errors.category = 'Category must be less than 50 characters';
  }
  
  if (formData.image_url && !isValidUrl(formData.image_url)) {
    errors.image_url = 'Please enter a valid URL';
  }
  
  if (formData.inventory_count !== undefined && formData.inventory_count < 0) {
    errors.inventory_count = 'Inventory count cannot be negative';
  }
  
  return errors;
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const hasErrors = (errors: ProductFormErrors): boolean => {
  return Object.values(errors).some(error => error !== undefined && error !== '');
};
