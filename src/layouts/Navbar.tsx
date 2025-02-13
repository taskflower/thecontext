import { NavLink } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { Button } from "@/components/ui/button";
import { AdminDropdown } from "./AdminDropdown";
import { AppLink } from "@/components/AppLink";

export const Navbar = () => {
  const { user } = useAuthState();

  // Funkcja pomocnicza do określania klasy dla aktywnych linków (przykład)
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-primary p-3 rounded bg-muted md:bg-white ${
      isActive ? "text-primary bg-muted" : "text-muted-foreground"
    }`;

  return (
    <nav className="border-b">
      <div className="container mx-auto p-3">
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <NavLink to={""} end className={getNavLinkClass}>
              Home
            </NavLink>
            <NavLink to={"about"} end className={getNavLinkClass}>
              Cases
            </NavLink>
            <NavLink to={"contact"} end className={getNavLinkClass}>
              Services
            </NavLink>
          </div>
          <div>
            {user ? (
              <AdminDropdown dashboardActiveClass={""} /* przekazujemy klasę aktywną w zależności od logiki */ />
            ) : (
              <Button variant="default" asChild>
                {/* Korzystamy z AppLink, by budować link do logowania z prefiksem języka */}
                <AppLink to="/login">Login</AppLink>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
