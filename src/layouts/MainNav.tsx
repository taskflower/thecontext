// src/components/layout/MainNav.tsx
import { NavLink } from "react-router-dom";

export function MainNav() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <NavLink
        to="/admin/documents"
        className={({ isActive }) =>
          `text-sm font-medium transition-colors hover:text-primary ${
            isActive ? "text-primary" : "text-muted-foreground"
          }`
        }
      >
        Documents
      </NavLink>
      <NavLink
        to="/admin/categories"
        className={({ isActive }) =>
          `text-sm font-medium transition-colors hover:text-primary ${
            isActive ? "text-primary" : "text-muted-foreground"
          }`
        }
      >
        Categories
      </NavLink>
    </nav>
  );
}