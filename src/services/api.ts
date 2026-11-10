import type { AuthUser } from "../types/auth";
import type {
  Category,
  InventoryLevel,
  InventoryLocation,
  InventoryMovement,
  PaginationMeta,
  Product,
  ProductImage,
  ProductVariant,
} from "../types/catalog";

// Prefer same-origin `/api/v1` (Vite proxy) so session/CSRF cookies stay reliable.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export type HealthResponse = {
  status: "ok" | "degraded";
  service: string;
  database: "up" | "down";
  timestamp: string;
};

export type DashboardSummary = {
  productsActive: number | null;
  productsDraft: number | null;
  categoriesActive: number | null;
  ordersPending: number | null;
  ordersToday: number | null;
  customersTotal: number | null;
  lowStockVariants: number | null;
};

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type ApiSuccess<T> = {
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    [key: string]: unknown;
  };
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

let csrfToken: string | null = null;

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

async function request<T>(
  path: string,
  init: RequestInit & { csrf?: boolean } = {},
): Promise<{ data: T; meta?: ApiSuccess<T>["meta"] }> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (init.csrf) {
    if (!csrfToken) {
      throw new ApiError("Missing CSRF token", 400, "CSRF_MISSING");
    }
    headers.set("x-csrf-token", csrfToken);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    let code: string | undefined;
    try {
      const body = (await response.json()) as ApiErrorBody;
      message = body.error?.message ?? message;
      code = body.error?.code;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, response.status, code);
  }

  if (response.status === 204) {
    return { data: undefined as T };
  }

  const payload = (await response.json()) as ApiSuccess<T>;
  return { data: payload.data, meta: payload.meta };
}

async function mutate<T>(path: string, init: RequestInit): Promise<T> {
  await api.getCsrf();
  const result = await request<T>(path, { ...init, csrf: true });
  return result.data;
}

function toQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const api = {
  getHealth: async () => (await request<HealthResponse>("/health")).data,

  getDashboardSummary: async () =>
    (await request<DashboardSummary>("/dashboard/summary")).data,

  getCsrf: async () => {
    const { data } = await request<{ csrfToken: string }>("/auth/csrf");
    setCsrfToken(data.csrfToken);
    return data.csrfToken;
  },

  login: async (email: string, password: string) => {
    await api.getCsrf();
    const { data } = await request<{ user: AuthUser; csrfToken: string }>("/auth/login", {
      method: "POST",
      csrf: true,
      body: JSON.stringify({ email, password }),
    });
    setCsrfToken(data.csrfToken);
    return data.user;
  },

  logout: async () => {
    await api.getCsrf();
    await request<{ ok: boolean }>("/auth/logout", {
      method: "POST",
      csrf: true,
    });
    setCsrfToken(null);
  },

  me: async () => (await request<{ user: AuthUser }>("/auth/me")).data.user,

  listCategories: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: "true" | "false" | "all";
  } = {}) => {
    const result = await request<Category[]>(
      `/categories${toQuery({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 50,
        search: params.search,
        isActive: params.isActive ?? "all",
      })}`,
    );
    return {
      items: result.data,
      pagination: result.meta?.pagination,
    };
  },

  createCategory: (body: {
    name: string;
    slug?: string;
    parentId?: string | null;
    isActive?: boolean;
  }) =>
    mutate<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateCategory: (
    id: string,
    body: {
      name?: string;
      slug?: string;
      parentId?: string | null;
      isActive?: boolean;
    },
  ) =>
    mutate<Category>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deactivateCategory: (id: string) =>
    mutate<Category>(`/categories/${id}`, {
      method: "DELETE",
    }),

  listProducts: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: "draft" | "active" | "archived" | "all";
    categoryId?: string;
  } = {}) => {
    const result = await request<Product[]>(
      `/products${toQuery({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        search: params.search,
        status: params.status ?? "all",
        categoryId: params.categoryId,
      })}`,
    );
    return {
      items: result.data,
      pagination: result.meta?.pagination,
    };
  },

  getProduct: async (id: string) => (await request<Product>(`/products/${id}`)).data,

  createProduct: (body: {
    name: string;
    slug?: string;
    description?: string | null;
    categoryId?: string | null;
    status?: "draft" | "active" | "archived";
    variants: ProductVariant[];
    images?: ProductImage[];
  }) =>
    mutate<Product>("/products", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateProduct: (
    id: string,
    body: {
      name?: string;
      slug?: string;
      description?: string | null;
      categoryId?: string | null;
      status?: "draft" | "active" | "archived";
      variants?: ProductVariant[];
      images?: ProductImage[];
    },
  ) =>
    mutate<Product>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  archiveProduct: (id: string) =>
    mutate<Product>(`/products/${id}`, {
      method: "DELETE",
    }),

  listInventoryLocations: async () =>
    (await request<InventoryLocation[]>("/inventory/locations")).data,

  listInventoryLevels: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    locationId?: string;
    lowStockOnly?: boolean;
  } = {}) => {
    const result = await request<InventoryLevel[]>(
      `/inventory/levels${toQuery({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 50,
        search: params.search,
        locationId: params.locationId,
        lowStockOnly: params.lowStockOnly ? "true" : "false",
      })}`,
    );
    return {
      items: result.data,
      pagination: result.meta?.pagination,
    };
  },

  listInventoryMovements: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    variantId?: string;
    locationId?: string;
  } = {}) => {
    const result = await request<InventoryMovement[]>(
      `/inventory/movements${toQuery({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 50,
        search: params.search,
        variantId: params.variantId,
        locationId: params.locationId,
      })}`,
    );
    return {
      items: result.data,
      pagination: result.meta?.pagination,
    };
  },

  adjustInventory: (body: {
    variantId: string;
    locationId: string;
    delta: number;
    reason: string;
    referenceId?: string | null;
  }) =>
    mutate<{
      movement: InventoryMovement;
      quantityOnHand: number;
      quantityReserved: number;
      quantityAvailable: number;
    }>("/inventory/adjustments", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
