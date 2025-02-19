import { Link, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Menu,
  LayoutDashboard,
  LogOut,
  Coins,
  User
} from "lucide-react";
import { getPathWithLanguage } from "@/utils/routeHelpers";
import { Trans } from "@lingui/macro";
import { useAuthState } from "@/hooks/useAuthState";
import { authService } from "@/services/authService";
import { AppLink } from "@/components/common/AppLink";

export const AdminDropdown = () => {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang || "en";
  const location = useLocation();
  const { user, backendUser } = useAuthState();
  const isTemplatesPage = location.pathname.includes("/tasks/templates");

  const handleLogout = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <span className="hidden md:inline">
            <Trans>Admin Panel</Trans>
          </span>
          <ChevronDown className="hidden md:inline h-4 w-4" />
          <span className="md:hidden">
            <Menu className="h-4 w-4" />
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-56">
        {user && (
          <>
            <DropdownMenuItem asChild>
              <AppLink to="/settings" admin className="w-full select-none">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </p>
                  {backendUser && (
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Coins className="h-4 w-4" />
                      <span>
                        <Trans>
                          Available tokens: {backendUser.availableTokens}
                        </Trans>
                      </span>
                    </p>
                  )}
                </div>
              </AppLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem asChild>
          <AppLink
            className={`w-full flex items-center ${
              isTemplatesPage ? "bg-accent text-accent-foreground" : ""
            }`}
            to="/tasks/templates"
            admin
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="ml-2">
              <Trans>Dashboard</Trans>
            </span>
          </AppLink>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="p-2 select-none">
          <div className="flex items-center justify-center rounded-md bg-muted p-1 w-full gap-1">
            <Link
              to={getPathWithLanguage(location.pathname, currentLang, "pl")}
              className={`flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2.5 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                currentLang === "pl"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted-foreground/10"
              }`}
            >
              PL
            </Link>
            <Link
              to={getPathWithLanguage(location.pathname, currentLang, "en")}
              className={`flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                currentLang === "en"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted-foreground/10"
              }`}
            >
              EN
            </Link>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} className="flex items-center">
          <LogOut className="h-4 w-4" />
          <span className="ml-2">
            <Trans>Log out</Trans>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};