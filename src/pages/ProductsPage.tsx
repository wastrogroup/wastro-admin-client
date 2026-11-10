import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { FormField } from "../components/ui/FormField";
import { Modal } from "../components/ui/Modal";
import { StateMessage } from "../components/ui/StateMessage";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Table, type TableColumn } from "../components/ui/Table";
import { useAuth } from "../features/auth/useAuth";
import { ApiError, api } from "../services/api";
import type { Category, Product } from "../types/catalog";

type FormState = {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  status: "draft" | "active" | "archived";
  sku: string;
  price: string;
  compareAtPrice: string;
  imageKey: string;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  categoryId: "",
  status: "draft",
  sku: "",
  price: "",
  compareAtPrice: "",
  imageKey: "",
};

export function ProductsPage() {
  const { user } = useAuth();
  const canWrite = user?.permissions.includes("products.write") ?? false;

  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "active" | "archived">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        api.listProducts({ search, status, pageSize: 50 }),
        api.listCategories({ pageSize: 100, isActive: "true" }),
      ]);
      setItems(productsResult.items);
      setCategories(categoriesResult.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [productsResult, categoriesResult] = await Promise.all([
          api.listProducts({ search: "", status: "all", pageSize: 50 }),
          api.listCategories({ pageSize: 100, isActive: "true" }),
        ]);
        if (!cancelled) {
          setItems(productsResult.items);
          setCategories(categoriesResult.items);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load products");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    const variant = product.variants[0];
    setEditing(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      categoryId: product.categoryId ?? "",
      status: product.status,
      sku: variant?.sku ?? "",
      price: variant ? String(variant.price) : "",
      compareAtPrice:
        variant?.compareAtPrice === null || variant?.compareAtPrice === undefined
          ? ""
          : String(variant.compareAtPrice),
      imageKey: product.images[0]?.storageKey ?? "",
    });
    setModalOpen(true);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      description: form.description || null,
      categoryId: form.categoryId || null,
      status: form.status,
      variants: [
        {
          sku: form.sku,
          price: Number(form.price),
          compareAtPrice: form.compareAtPrice === "" ? null : Number(form.compareAtPrice),
          currency: "INR",
          attributes: {},
        },
      ],
      images: form.imageKey
        ? [{ storageKey: form.imageKey, sortOrder: 0, variantId: null }]
        : [],
    };

    try {
      if (editing) {
        await api.updateProduct(editing.id, payload);
      } else {
        await api.createProduct(payload);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onArchive(product: Product) {
    if (!window.confirm(`Archive product "${product.name}"?`)) return;
    try {
      await api.archiveProduct(product.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Archive failed");
    }
  }

  const categoryName = (id: string | null) =>
    categories.find((category) => category.id === id)?.name ?? "—";

  const columns: TableColumn<Product>[] = [
    { key: "name", header: "Name", render: (row) => row.name },
    { key: "sku", header: "SKU", render: (row) => row.variants[0]?.sku ?? "—" },
    {
      key: "price",
      header: "Price",
      render: (row) =>
        row.variants[0] ? `₹${Number(row.variants[0].price).toFixed(2)}` : "—",
    },
    { key: "category", header: "Category", render: (row) => categoryName(row.categoryId) },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge
          tone={
            row.status === "active" ? "accent" : row.status === "draft" ? "warning" : "neutral"
          }
        >
          {row.status}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) =>
        canWrite ? (
          <div className="row-actions">
            <Button variant="secondary" onClick={() => openEdit(row)}>
              Edit
            </Button>
            {row.status !== "archived" ? (
              <Button variant="danger" onClick={() => void onArchive(row)}>
                Archive
              </Button>
            ) : null}
          </div>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Products</h1>
          <p className="subtitle">Manage apparel and equipment for professionals.</p>
        </div>
        {canWrite ? (
          <Button variant="accent" onClick={openCreate}>
            Add product
          </Button>
        ) : null}
      </header>

      <Card>
        <form
          className="toolbar"
          onSubmit={(event) => {
            event.preventDefault();
            void load();
          }}
        >
          <FormField
            label="Search"
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name or slug"
          />
          <label className="ui-field">
            <span className="ui-field-label">Status</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "all" | "draft" | "active" | "archived")
              }
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <Button type="submit" variant="secondary">
            Filter
          </Button>
        </form>
      </Card>

      {error ? <StateMessage variant="error" title="Error" description={error} /> : null}
      {loading ? <StateMessage variant="loading" title="Loading products…" /> : null}

      {!loading ? (
        <Card title="All products">
          {items.length === 0 ? (
            <StateMessage
              variant="empty"
              title="No products yet"
              description="Add a product with SKU, price, and publish status."
            />
          ) : (
            <Table columns={columns} rows={items} rowKey={(row) => row.id} />
          )}
        </Card>
      ) : null}

      <Modal
        open={modalOpen}
        title={editing ? "Edit product" : "Add product"}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="product-form" variant="accent" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        <form id="product-form" className="form-grid" onSubmit={onSubmit}>
          <FormField
            label="Name"
            name="name"
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <FormField
            label="Slug"
            name="slug"
            hint="Leave blank to auto-generate"
            value={form.slug}
            onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
          />
          <label className="ui-field">
            <span className="ui-field-label">Description</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </label>
          <label className="ui-field">
            <span className="ui-field-label">Category</span>
            <select
              value={form.categoryId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, categoryId: event.target.value }))
              }
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-field">
            <span className="ui-field-label">Status</span>
            <select
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  status: event.target.value as "draft" | "active" | "archived",
                }))
              }
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <FormField
            label="SKU"
            name="sku"
            required
            value={form.sku}
            onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
          />
          <FormField
            label="Price (INR)"
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
          />
          <FormField
            label="Compare-at price"
            name="compareAtPrice"
            type="number"
            min="0"
            step="0.01"
            value={form.compareAtPrice}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, compareAtPrice: event.target.value }))
            }
          />
          <FormField
            label="Image storage key"
            name="imageKey"
            hint="Object storage key / path (upload provider comes later)"
            value={form.imageKey}
            onChange={(event) => setForm((prev) => ({ ...prev, imageKey: event.target.value }))}
          />
        </form>
      </Modal>
    </div>
  );
}
