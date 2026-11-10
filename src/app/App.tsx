import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../features/auth/AuthContext";
import { RequireAuth } from "../features/auth/RequireAuth";
import { AdminLayout } from "../layouts/AdminLayout";
import { CategoriesPage } from "../pages/CategoriesPage";
import { DashboardPage } from "../pages/DashboardPage";
import { InventoryPage } from "../pages/InventoryPage";
import { LoginPage } from "../pages/LoginPage";
import { ModulePlaceholderPage } from "../pages/ModulePlaceholderPage";
import { ProductsPage } from "../pages/ProductsPage";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route
              path="orders"
              element={
                <ModulePlaceholderPage
                  title="Orders"
                  description="Review and update customer orders."
                  emptyTitle="No orders yet"
                  emptyDescription="Order management arrives in Phase 07."
                />
              }
            />
            <Route
              path="customers"
              element={
                <ModulePlaceholderPage
                  title="Customers"
                  description="View customer profiles and order history."
                  emptyTitle="No customers yet"
                  emptyDescription="Customer management arrives in Phase 07."
                />
              }
            />
            <Route
              path="payments"
              element={
                <ModulePlaceholderPage
                  title="Payments"
                  description="Inspect payment and refund records."
                  emptyTitle="No payments yet"
                  emptyDescription="Payment workflows arrive in Phase 08."
                />
              }
            />
            <Route
              path="reports"
              element={
                <ModulePlaceholderPage
                  title="Reports"
                  description="Sales and operational reporting."
                  emptyTitle="No reports yet"
                  emptyDescription="Analytics arrive in Phase 09."
                />
              }
            />
            <Route
              path="users"
              element={
                <ModulePlaceholderPage
                  title="Users"
                  description="Administer staff accounts and roles."
                  emptyTitle="No user tools yet"
                  emptyDescription="User administration arrives in Phase 09."
                />
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
