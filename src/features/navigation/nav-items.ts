import type { ComponentType } from "react";
import {
  IconBox,
  IconCard,
  IconCart,
  IconChart,
  IconDashboard,
  IconFolders,
  IconShield,
  IconUsers,
  IconWarehouse,
} from "../../components/icons";

export type NavItem = {
  label: string;
  to: string;
  permission?: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/", icon: IconDashboard },
  { label: "Products", to: "/products", permission: "products.read", icon: IconBox },
  { label: "Categories", to: "/categories", permission: "categories.read", icon: IconFolders },
  { label: "Inventory", to: "/inventory", permission: "inventory.read", icon: IconWarehouse },
  { label: "Orders", to: "/orders", permission: "orders.read", icon: IconCart },
  { label: "Customers", to: "/customers", permission: "customers.read", icon: IconUsers },
  { label: "Payments", to: "/payments", permission: "payments.read", icon: IconCard },
  { label: "Reports", to: "/reports", permission: "reports.read", icon: IconChart },
  { label: "Users", to: "/users", permission: "users.manage", icon: IconShield },
];

export function filterNavItems(permissions: string[] | undefined): NavItem[] {
  const set = new Set(permissions ?? []);
  return NAV_ITEMS.filter((item) => !item.permission || set.has(item.permission));
}
