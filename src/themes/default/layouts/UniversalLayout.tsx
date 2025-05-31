// src/themes/default/layouts/UniversalLayout.tsx - Modern Dropbox Style
import { useParams } from "react-router-dom";
import UserDropdown from "@/auth/UserDropdown";
import WorkspaceNavigation from "../commons/WorkspaceNavigation";

export default function UniversalLayout({ children }: any) {
  const { config } = useParams<{ config?: string }>();
  const cfg = config || "exampleTicketApp";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Modern Header with Glass Effect */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                  {cfg}
                </h1>
              </div>
            </div>
            
            {/* Navigation & User */}
            <div className="flex items-center space-x-6">
              <WorkspaceNavigation variant="universal" />
              <div className="h-6 w-px bg-slate-200"></div>
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
            <div className="p-8 lg:p-12">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <p className="text-sm text-slate-600 font-medium">
                © {new Date().getFullYear()} {cfg}
              </p>
              <div className="hidden md:flex items-center space-x-4 text-xs text-slate-500">
                <span>Built with Universal Engine</span>
                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                <span>Powered by AI</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}