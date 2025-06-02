// src/themes/default/layouts/Simple.tsx - Using WorkspaceNavigation component
import { useParams } from "react-router-dom";
import UserDropdown from "@/auth/UserDropdown";
import WorkspaceNavigation from "../commons/WorkspaceNavigation";

export default function Simple({ children }: any) {
  const { config } = useParams<{ config?: string }>();
  const cfg = config || "exampleTicketApp";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 bg-white border-b z-10">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold">{cfg}</h1>
          
          <div className="flex items-center gap-8">
            <WorkspaceNavigation  />
            <UserDropdown />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-12 py-8">
        <div className="p-6">
          {children}
        </div>
      </main>


      <footer className="bg-white border-t">
        <div className="container mx-auto px-6 py-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} {cfg}
        </div>
      </footer>
    </div>
  );
}