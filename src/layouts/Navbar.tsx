// src/layouts/Navbar.tsx
import { Link, NavLink, useParams } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { Button } from "@/components/ui/button";
import { AdminDropdown } from "./AdminDropdown";


export const Navbar = () => {
  const { user } = useAuthState();

  // Pobieramy parametr 'module' – będzie dostępny przy trasach np. /admin/:module/...
  const { module } = useParams<{ module?: string }>();

  // Funkcja pomocnicza do określania klasy dla aktywnych linków (dla publicznych stron)
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-primary p-3 rounded bg-muted md:bg-white ${
      isActive ? "text-primary bg-muted" : "text-muted-foreground"
    }`;

  // Przyjmijmy, że w sekcji admin chcemy wyróżnić Dashboard, jeśli module === "boards"
  const dashboardActiveClass =
    module === "boards" ? "text-primary bg-muted" : "text-muted-foreground";

  return (  
    <nav className="border-b">
      <div className="container mx-auto p-3">
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <NavLink to="/" end className={getNavLinkClass}>
              Home
            </NavLink>
            <NavLink to="/about" end className={getNavLinkClass}>
              Case Studies
            </NavLink>
            <NavLink to="/contact" end className={getNavLinkClass}>
              Services
            </NavLink>
          </div>
          <div>
            {user ? (
              <AdminDropdown dashboardActiveClass={dashboardActiveClass} />
            ) : (
              <Button variant="default" asChild>
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
