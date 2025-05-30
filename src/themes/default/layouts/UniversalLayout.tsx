// src/themes/default/layouts/UniversalLayout.tsx - Using WorkspaceNavigation component
import { useParams } from "react-router-dom";
import UserDropdown from "@/auth/UserDropdown";
import WorkspaceNavigation from "../commons/WorkspaceNavigation";


export default function UniversalLayout({ children }: any) {
  const { config } = useParams<{ config?: string }>();
  const cfg = config || "exampleTicketApp";

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col w-full">
       <header className="sticky top-0 bg-white border-b z-10">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold">{cfg}</h1>
          
          <div className="flex items-center gap-8">
            <WorkspaceNavigation variant="simple" />
            <UserDropdown />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-12 py-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          {children}
        </div>
      </main>

      <footer className="border-t border-zinc-200/50 bg-white/50 mt-16">
        <div className="container mx-auto px-6 py-6 text-center text-xs text-zinc-500 font-medium">
          © {new Date().getFullYear()} {cfg} — Built with Universal Engine + LLM
        </div>
      </footer>
    </div>
  );
}