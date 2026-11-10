import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";
import { IconLogout, IconMenu, IconPanel } from "../components/icons";
import { Button } from "../components/ui/Button";
import { filterNavItems } from "../features/navigation/nav-items";
import { useAuth } from "../features/auth/useAuth";

export function AdminLayout() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navItems = filterNavItems(user?.permissions);

  async function onLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div
      className={`admin-shell ${mobileOpen ? "nav-open" : ""} ${collapsed ? "sidebar-collapsed" : ""}`}
    >
      <aside className="admin-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <BrandMark size={36} variant="brand" />
            <div className="sidebar-brand-copy">
              <strong>Wastro</strong>
              <p>Admin</p>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-collapse"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((value) => !value)}
          >
            <IconPanel size={16} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                onClick={() => setMobileOpen(false)}
                title={item.label}
              >
                <Icon size={18} className="nav-link-icon" />
                <span className="nav-link-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar" aria-hidden="true">
            {(user?.name ?? "A").slice(0, 1).toUpperCase()}
          </div>
          <div className="sidebar-user-copy">
            <strong>{user?.name}</strong>
            <p>{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            className="sidebar-logout"
            onClick={onLogout}
            disabled={loggingOut}
            aria-label="Sign out"
            title="Sign out"
          >
            <IconLogout size={16} />
          </Button>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-mobile-bar">
          <button
            type="button"
            className="menu-toggle"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <IconMenu size={18} />
            Menu
          </button>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      {mobileOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
    </div>
  );
}
