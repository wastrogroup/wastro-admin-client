import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  IconAlert,
  IconBox,
  IconCart,
  IconFolders,
  IconRefresh,
  IconUsers,
  IconWarehouse,
} from "../components/icons";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { StateMessage } from "../components/ui/StateMessage";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Table, type TableColumn } from "../components/ui/Table";
import { useAuth } from "../features/auth/useAuth";
import { api, type DashboardSummary } from "../services/api";

type LoadState =
  | { status: "loading" }
  | { status: "success"; data: DashboardSummary }
  | { status: "error"; message: string };

type KpiCard = {
  key: keyof DashboardSummary;
  label: string;
  hint: string;
  permission?: string;
  tone: "teal" | "gold" | "rose" | "accent" | "slate";
  icon: typeof IconUsers;
  to?: string;
};

type ActivityRow = {
  id: string;
  label: string;
  detail: string;
  meta: string;
  status: string;
  tone: "warning" | "accent" | "neutral" | "success";
};

const KPI_CARDS: KpiCard[] = [
  {
    key: "customersTotal",
    label: "Total customers",
    hint: "Registered users",
    permission: "customers.read",
    tone: "teal",
    icon: IconUsers,
    to: "/customers",
  },
  {
    key: "ordersToday",
    label: "Today's orders",
    hint: "Orders placed today",
    permission: "orders.read",
    tone: "rose",
    icon: IconCart,
    to: "/orders",
  },
  {
    key: "ordersPending",
    label: "Pending orders",
    hint: "Need attention",
    permission: "orders.read",
    tone: "gold",
    icon: IconCart,
    to: "/orders",
  },
  {
    key: "productsActive",
    label: "Active products",
    hint: "Live in catalog",
    permission: "products.read",
    tone: "accent",
    icon: IconBox,
    to: "/products",
  },
  {
    key: "lowStockVariants",
    label: "Low stock SKUs",
    hint: "Below threshold",
    permission: "inventory.read",
    tone: "slate",
    icon: IconWarehouse,
    to: "/inventory",
  },
];

const activityColumns: TableColumn<ActivityRow>[] = [
  { key: "label", header: "Item", render: (row) => <strong>{row.label}</strong> },
  { key: "detail", header: "Detail", render: (row) => row.detail },
  { key: "meta", header: "Meta", render: (row) => row.meta },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge tone={row.tone}>{row.status}</StatusBadge>,
  },
];

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function DashboardPage() {
  const { user } = useAuth();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await api.getDashboardSummary();
      setState({ status: "success", data });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Unable to load dashboard",
      });
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await api.getDashboardSummary();
        if (!cancelled) {
          setState({ status: "success", data });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Unable to load dashboard",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const permissions = new Set(user?.permissions ?? []);
  const visibleCards = KPI_CARDS.filter(
    (card) => !card.permission || permissions.has(card.permission),
  );

  const data = state.status === "success" ? state.data : null;
  const pendingOrders = data?.ordersPending ?? 0;
  const lowStock = data?.lowStockVariants ?? 0;
  const draftProducts = data?.productsDraft ?? 0;

  const alerts: Array<{ message: string; to: string; label: string }> = [];
  if (permissions.has("orders.read") && pendingOrders > 0) {
    alerts.push({
      message: `${pendingOrders} order(s) need attention`,
      to: "/orders",
      label: "View orders",
    });
  }
  if (permissions.has("inventory.read") && lowStock > 0) {
    alerts.push({
      message: `${lowStock} SKU(s) are low on stock`,
      to: "/inventory",
      label: "View inventory",
    });
  }
  if (permissions.has("products.read") && draftProducts > 0) {
    alerts.push({
      message: `${draftProducts} draft product(s) waiting to publish`,
      to: "/products",
      label: "View products",
    });
  }

  const activityRows: ActivityRow[] = [];
  if (data) {
    if (permissions.has("categories.read") && data.categoriesActive != null) {
      activityRows.push({
        id: "categories",
        label: "Categories",
        detail: "Active browse paths",
        meta: `${data.categoriesActive} live`,
        status: "Ready",
        tone: "success",
      });
    }
    if (permissions.has("products.read") && data.productsDraft != null) {
      activityRows.push({
        id: "drafts",
        label: "Draft products",
        detail: "Not yet published",
        meta: `${data.productsDraft} items`,
        status: "Draft",
        tone: "warning",
      });
    }
    if (permissions.has("inventory.read") && data.lowStockVariants != null) {
      activityRows.push({
        id: "stock",
        label: "Inventory watch",
        detail: "Variants below threshold",
        meta: `${data.lowStockVariants} SKUs`,
        status: data.lowStockVariants > 0 ? "Low" : "Healthy",
        tone: data.lowStockVariants > 0 ? "warning" : "accent",
      });
    }
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">{formatDateLabel(new Date())}</p>
          <h1>Dashboard</h1>
          <p className="subtitle">Clean overview of catalog, stock, and order activity.</p>
        </div>
        <Button variant="secondary" onClick={() => void load()} disabled={refreshing}>
          <IconRefresh size={16} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </Button>
      </header>

      {state.status === "loading" ? (
        <StateMessage variant="loading" title="Loading dashboard…" />
      ) : null}

      {state.status === "error" ? (
        <StateMessage
          variant="error"
          title="Could not load dashboard"
          description={state.message}
        />
      ) : null}

      {state.status === "success" ? (
        <>
          {visibleCards.length === 0 ? (
            <StateMessage
              variant="empty"
              title="No metrics available"
              description="Your role does not include dashboard metric permissions yet."
            />
          ) : (
            <div className="kpi-grid">
              {visibleCards.map((card) => {
                const Icon = card.icon;
                const value = state.data[card.key];
                const body = (
                  <>
                    <div className={`kpi-icon kpi-icon-${card.tone}`}>
                      <Icon size={18} />
                    </div>
                    <div className="kpi-copy">
                      <p className="kpi-value">{value ?? "—"}</p>
                      <p className="kpi-label">{card.label}</p>
                      <p className="kpi-hint">{card.hint}</p>
                    </div>
                  </>
                );

                return card.to ? (
                  <Link key={card.key} to={card.to} className="kpi-card">
                    {body}
                  </Link>
                ) : (
                  <div key={card.key} className="kpi-card">
                    {body}
                  </div>
                );
              })}
            </div>
          )}

          <div className="dashboard-split">
            <Card
              className="alerts-card"
              title="Alerts"
              actions={<span className="card-subtitle">Important things to check</span>}
            >
              {alerts.length === 0 ? (
                <div className="alert-empty">
                  <IconFolders size={18} />
                  <p>All clear for now. No urgent items.</p>
                </div>
              ) : (
                <div className="alert-list">
                  {alerts.map((alert) => (
                    <div key={alert.message} className="alert-banner">
                      <div className="alert-banner-copy">
                        <IconAlert size={16} />
                        <p>{alert.message}</p>
                      </div>
                      <Link to={alert.to} className="text-link">
                        {alert.label} →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card
              className="activity-card"
              title="Store activity"
              actions={
                <Link to="/orders" className="text-link">
                  View all →
                </Link>
              }
            >
              {activityRows.length === 0 ? (
                <StateMessage
                  variant="empty"
                  title="No recent activity"
                  description="Order and customer feeds arrive with Phase 07."
                />
              ) : (
                <Table columns={activityColumns} rows={activityRows} rowKey={(row) => row.id} />
              )}
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
