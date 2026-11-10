import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { FormField } from "../components/ui/FormField";
import { Modal } from "../components/ui/Modal";
import { StateMessage } from "../components/ui/StateMessage";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Table, type TableColumn } from "../components/ui/Table";
import { useAuth } from "../features/auth/useAuth";
import { ApiError, api } from "../services/api";
import type {
  InventoryLevel,
  InventoryLocation,
  InventoryMovement,
  Product,
} from "../types/catalog";

type AdjustForm = {
  variantId: string;
  locationId: string;
  delta: string;
  reason: string;
};

export function InventoryPage() {
  const { user } = useAuth();
  const canWrite = user?.permissions.includes("inventory.write") ?? false;

  const [levels, setLevels] = useState<InventoryLevel[]>([]);
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);

  const [search, setSearch] = useState("");
  const [locationId, setLocationId] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AdjustForm>({
    variantId: "",
    locationId: "",
    delta: "",
    reason: "",
  });

  const variantOptions = useMemo(
    () =>
      products.flatMap((product) =>
        product.variants
          .filter((variant) => Boolean(variant.id))
          .map((variant) => ({
            id: variant.id as string,
            label: `${product.name} · ${variant.sku}`,
          })),
      ),
    [products],
  );

  async function loadLevels(nextSearch = search) {
    setLoading(true);
    setError(null);
    try {
      const [levelsResult, locationsResult, productsResult] = await Promise.all([
        api.listInventoryLevels({
          search: nextSearch,
          locationId: locationId || undefined,
          lowStockOnly,
          pageSize: 100,
        }),
        api.listInventoryLocations(),
        api.listProducts({ pageSize: 100, status: "all" }),
      ]);
      setLevels(levelsResult.items);
      setLocations(locationsResult);
      setProducts(productsResult.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [levelsResult, locationsResult, productsResult] = await Promise.all([
          api.listInventoryLevels({ pageSize: 100 }),
          api.listInventoryLocations(),
          api.listProducts({ pageSize: 100, status: "all" }),
        ]);
        if (!cancelled) {
          setLevels(levelsResult.items);
          setLocations(locationsResult);
          setProducts(productsResult.items);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load inventory");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function openAdjust(level?: InventoryLevel) {
    setForm({
      variantId: level?.variantId ?? "",
      locationId: level?.locationId ?? locations[0]?.id ?? "",
      delta: "",
      reason: "",
    });
    setAdjustOpen(true);
  }

  async function openHistory(level?: InventoryLevel) {
    setHistoryOpen(true);
    try {
      const result = await api.listInventoryMovements({
        variantId: level?.variantId,
        locationId: level?.locationId,
        pageSize: 50,
      });
      setMovements(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load movements");
    }
  }

  async function onAdjust(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.adjustInventory({
        variantId: form.variantId,
        locationId: form.locationId,
        delta: Number(form.delta),
        reason: form.reason,
      });
      setAdjustOpen(false);
      await loadLevels();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Adjustment failed");
    } finally {
      setSaving(false);
    }
  }

  const columns: TableColumn<InventoryLevel>[] = [
    { key: "product", header: "Product", render: (row) => row.productName },
    { key: "sku", header: "SKU", render: (row) => row.sku },
    { key: "location", header: "Location", render: (row) => row.locationCode },
    { key: "onHand", header: "On hand", render: (row) => row.quantityOnHand },
    { key: "reserved", header: "Reserved", render: (row) => row.quantityReserved },
    {
      key: "available",
      header: "Available",
      render: (row) =>
        row.isLowStock ? (
          <span className="row-actions">
            <span className="stock-low">{row.quantityAvailable}</span>
            <StatusBadge tone="warning">Low</StatusBadge>
          </span>
        ) : (
          row.quantityAvailable
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="row-actions">
          {canWrite ? (
            <Button variant="secondary" onClick={() => openAdjust(row)}>
              Adjust
            </Button>
          ) : null}
          <Button variant="secondary" onClick={() => void openHistory(row)}>
            History
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Inventory</h1>
          <p className="subtitle">Keep stock accurate so teams can deliver with confidence.</p>
        </div>
        <div className="row-actions">
          <Button variant="secondary" onClick={() => void openHistory()}>
            All movements
          </Button>
          {canWrite ? (
            <Button variant="accent" onClick={() => openAdjust()}>
              Adjust stock
            </Button>
          ) : null}
        </div>
      </header>

      <Card>
        <form
          className="toolbar inventory-toolbar"
          onSubmit={(event) => {
            event.preventDefault();
            void loadLevels();
          }}
        >
          <FormField
            label="Search"
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="SKU or product"
          />
          <label className="ui-field">
            <span className="ui-field-label">Location</span>
            <select value={locationId} onChange={(event) => setLocationId(event.target.value)}>
              <option value="">All locations</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-field checkbox-field">
            <span className="ui-field-label">Low stock only</span>
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(event) => setLowStockOnly(event.target.checked)}
            />
          </label>
          <Button type="submit" variant="secondary">
            Filter
          </Button>
        </form>
      </Card>

      {error ? <StateMessage variant="error" title="Error" description={error} /> : null}
      {loading ? <StateMessage variant="loading" title="Loading inventory…" /> : null}

      {!loading ? (
        <Card title="Stock levels">
          {levels.length === 0 ? (
            <StateMessage
              variant="empty"
              title="No inventory rows yet"
              description="Use Adjust stock to create the first on-hand quantity for a product SKU."
            />
          ) : (
            <Table
              columns={columns}
              rows={levels}
              rowKey={(row) => `${row.variantId}:${row.locationId}`}
            />
          )}
        </Card>
      ) : null}

      <Modal
        open={adjustOpen}
        title="Adjust stock"
        onClose={() => setAdjustOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdjustOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="inventory-adjust-form" variant="accent" disabled={saving}>
              {saving ? "Saving…" : "Apply"}
            </Button>
          </>
        }
      >
        <form id="inventory-adjust-form" className="form-grid" onSubmit={onAdjust}>
          <label className="ui-field">
            <span className="ui-field-label">Variant</span>
            <select
              required
              value={form.variantId}
              onChange={(event) => setForm((prev) => ({ ...prev, variantId: event.target.value }))}
            >
              <option value="">Select variant</option>
              {variantOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-field">
            <span className="ui-field-label">Location</span>
            <select
              required
              value={form.locationId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, locationId: event.target.value }))
              }
            >
              <option value="">Select location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </label>
          <FormField
            label="Delta"
            name="delta"
            type="number"
            required
            hint="Use positive to add stock, negative to remove"
            value={form.delta}
            onChange={(event) => setForm((prev) => ({ ...prev, delta: event.target.value }))}
          />
          <FormField
            label="Reason"
            name="reason"
            required
            minLength={3}
            value={form.reason}
            onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
          />
        </form>
      </Modal>

      <Modal
        open={historyOpen}
        title="Inventory movements"
        onClose={() => setHistoryOpen(false)}
        footer={
          <Button variant="secondary" onClick={() => setHistoryOpen(false)}>
            Close
          </Button>
        }
      >
        {movements.length === 0 ? (
          <StateMessage variant="empty" title="No movements recorded" />
        ) : (
          <Table
            columns={[
              {
                key: "when",
                header: "When",
                render: (row) => new Date(row.createdAt).toLocaleString(),
              },
              { key: "sku", header: "SKU", render: (row) => row.sku },
              { key: "location", header: "Location", render: (row) => row.locationCode },
              {
                key: "delta",
                header: "Delta",
                render: (row) => (row.delta > 0 ? `+${row.delta}` : String(row.delta)),
              },
              { key: "reason", header: "Reason", render: (row) => row.reason },
            ]}
            rows={movements}
            rowKey={(row) => row.id}
          />
        )}
      </Modal>
    </div>
  );
}
