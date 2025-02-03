// src/components/AdminDropdown.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu } from "lucide-react";
import { auth } from "@/firebase/config";

interface AdminDropdownProps {
  dashboardActiveClass: string;
}

export const AdminDropdown = ({ dashboardActiveClass }: AdminDropdownProps) => {
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 w-full md:w-auto">
          {/* Na desktopie: tekst i ikona */}
          <span className="hidden md:inline">Panel Admin</span>
          <ChevronDown className="hidden md:inline h-4 w-4" />
          
          {/* Na mobile: hamburger */}
          <span className="md:hidden">
            <Menu className="h-4 w-4" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-full md:w-auto">
        <DropdownMenuItem asChild>
          <Link to="/admin/boards/instances" className={dashboardActiveClass}>
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          Wyloguj się
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
