// src/components/Navbar.tsx
import { useLocation } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { Button } from "@/components/ui/button";
import { AdminDropdown } from "./AdminDropdown";
import { AppLink } from "@/components/AppLink";
import { useLanguage } from "@/context/LanguageContext";

export const Navbar = () => {
  const { user } = useAuthState();
  const location = useLocation();
  const { currentLang } = useLanguage();

  const isAdminSection = location.pathname.includes("/admin/");

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-primary p-3 rounded bg-muted md:bg-white ${
      isActive ? "text-primary bg-muted" : "text-muted-foreground"
    }`;

  return (
    <nav className="border-b">
      <div className="container mx-auto p-3">
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <AppLink
              to="/"
              forcePublic
              className={getNavLinkClass({
                isActive: location.pathname === `/${currentLang}`,
              })}
            >
              Home
            </AppLink>
            <AppLink
              forcePublic
              to="/about"
              className={getNavLinkClass({
                isActive: location.pathname.includes("/about"),
              })}
            >
              Cases
            </AppLink>
            <AppLink
              forcePublic
              to="/contact"
              className={getNavLinkClass({
                isActive: location.pathname.includes("/contact"),
              })}
            >
              Services
            </AppLink>
          </div>
          <div>
            {user ? (
              <AdminDropdown
                dashboardActiveClass={getNavLinkClass({
                  isActive: isAdminSection,
                })}
              />
            ) : (
              <Button variant="default" asChild>
                <AppLink to="/login">Login</AppLink>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
