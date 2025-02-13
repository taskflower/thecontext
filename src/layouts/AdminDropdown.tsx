import { Link, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu } from "lucide-react";
import { auth } from "@/firebase/config";
import { getPathWithLanguage } from "@/utils/routeHelpers";
import { Trans } from "@lingui/macro";

interface AdminDropdownProps {
  dashboardActiveClass: string;
}

export const AdminDropdown = ({ dashboardActiveClass }: AdminDropdownProps) => {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang || "en";
  const location = useLocation();

  const handleLogout = () => {
    auth.signOut();
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
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuItem asChild>
          <Link
            to={`/admin/${currentLang}/boards/instances`}
            className={dashboardActiveClass}
          >
            <Trans>Dashboard</Trans>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Language selector in shadcn/ui style */}
        <div className=" py-1.5">
          <div className="flex items-center justify-center rounded-md bg-muted p-1 w-full gap-1">
            <Link
              to={getPathWithLanguage(location.pathname, currentLang, "pl")}
              className={`flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2.5 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                currentLang === "pl"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted-foreground/10"
              }`}
            >
              <Trans>PL</Trans>
            </Link>
            <Link
              to={getPathWithLanguage(location.pathname, currentLang, "en")}
              className={`flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                currentLang === "en"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted-foreground/10"
              }`}
            >
              <Trans>EN</Trans>
            </Link>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <Trans>Log out</Trans>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
