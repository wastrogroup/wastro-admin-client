export type Category = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductVariant = {
  id?: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  attributes?: Record<string, string | number | boolean>;
};

export type ProductImage = {
  id?: string;
  storageKey: string;
  sortOrder: number;
  variantId: string | null;
};

export type Product = {
  id: string;
  categoryId: string | null;
  name: string;
  slug: string;
  description: string | null;
  status: "draft" | "active" | "archived";
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  images: ProductImage[];
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type InventoryLocation = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
};

export type InventoryLevel = {
  variantId: string;
  locationId: string;
  sku: string;
  productId: string;
  productName: string;
  locationName: string;
  locationCode: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  isLowStock: boolean;
  updatedAt: string;
};

export type InventoryMovement = {
  id: string;
  variantId: string;
  locationId: string;
  sku: string;
  productName: string;
  locationCode: string;
  delta: number;
  reason: string;
  referenceId: string | null;
  actorId: string | null;
  createdAt: string;
};
