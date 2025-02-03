// src/layouts/Navbar.tsx
import { Link, NavLink, useParams } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { auth } from "@/firebase/config";

export const Navbar = () => {
  const { user } = useAuthState();

  // Pobieramy parametr 'module' – będzie dostępny przy trasach np. /admin/:module/...
  const { module } = useParams<{ module?: string }>();

  const handleLogout = () => {
    auth.signOut();
  };

  // Funkcja pomocnicza do określania klasy dla aktywnych linków (dla publicznych stron)
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-primary p-3 rounded ${
      isActive ? "text-primary bg-muted" : "text-muted-foreground"
    }`;

  // Przyjmijmy, że w sekcji admin chcemy wyróżnić Dashboard, jeśli module === "boards"
  const dashboardActiveClass =
    module === "boards" ? "text-primary bg-muted" : "text-muted-foreground";

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    Panel Admin
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Przykładowo: Dashboard jest wyróżniany, gdy aktualny moduł to "boards" */}
                  <DropdownMenuItem asChild>
                    <Link
                      to="/admin/boards/instances"
                      className={dashboardActiveClass}
                    >
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Wyloguj się
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
