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
import type { Category } from "../types/catalog";

type FormState = {
  name: string;
  slug: string;
  isActive: boolean;
};

const emptyForm: FormState = { name: "", slug: "", isActive: true };

export function CategoriesPage() {
  const { user } = useAuth();
  const canWrite = user?.permissions.includes("categories.write") ?? false;

  const [items, setItems] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await api.listCategories({ search, pageSize: 100 });
      setItems(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await api.listCategories({ search: "", pageSize: 100 });
        if (!cancelled) {
          setItems(result.items);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load categories");
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

  function openEdit(category: Category) {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      isActive: category.isActive,
    });
    setModalOpen(true);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await api.updateCategory(editing.id, {
          name: form.name,
          slug: form.slug || undefined,
          isActive: form.isActive,
        });
      } else {
        await api.createCategory({
          name: form.name,
          slug: form.slug || undefined,
          isActive: form.isActive,
        });
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDeactivate(category: Category) {
    if (!window.confirm(`Deactivate category "${category.name}"?`)) return;
    try {
      await api.deactivateCategory(category.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deactivate failed");
    }
  }

  const columns: TableColumn<Category>[] = [
    { key: "name", header: "Name", render: (row) => row.name },
    { key: "slug", header: "Slug", render: (row) => row.slug },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge tone={row.isActive ? "accent" : "neutral"}>
          {row.isActive ? "Active" : "Inactive"}
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
            {row.isActive ? (
              <Button variant="danger" onClick={() => void onDeactivate(row)}>
                Deactivate
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
          <h1>Categories</h1>
          <p className="subtitle">Clear routes into apparel, equipment, and more.</p>
        </div>
        {canWrite ? (
          <Button variant="accent" onClick={openCreate}>
            Add category
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
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </Card>

      {error ? <StateMessage variant="error" title="Error" description={error} /> : null}
      {loading ? <StateMessage variant="loading" title="Loading categories…" /> : null}

      {!loading ? (
        <Card title="All categories">
          {items.length === 0 ? (
            <StateMessage
              variant="empty"
              title="No categories yet"
              description="Create your first category to organize the catalog."
            />
          ) : (
            <Table columns={columns} rows={items} rowKey={(row) => row.id} />
          )}
        </Card>
      ) : null}

      <Modal
        open={modalOpen}
        title={editing ? "Edit category" : "Add category"}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="category-form" variant="accent" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        <form id="category-form" className="form-grid" onSubmit={onSubmit}>
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
            hint="Leave blank to auto-generate from name"
            value={form.slug}
            onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
          />
          <label className="ui-field checkbox-field">
            <span className="ui-field-label">Active</span>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, isActive: event.target.checked }))
              }
            />
          </label>
        </form>
      </Modal>
    </div>
  );
}
