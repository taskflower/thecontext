import React from "react";
import { useFlowStore } from "../../../core/context";
import { RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

type SimpleLayoutProps = {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  showFooter?: boolean;
};

export default function SimpleLayout({
  children,
  title = "Flow Application",
  showHeader = true,
  showFooter = true,
}: SimpleLayoutProps) {
  const { currentNodeIndex, reset } = useFlowStore();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {showHeader && (
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex justify-between items-center max-w-6xl mx-auto p-4">
            <Link to="/" className="flex items-center gap-2">
              <h1 className="m-0 text-xl font-semibold text-gray-800">
                {title}
              </h1>
            </Link>
            <div className="flex gap-2">
              <button
                className="py-2 px-4 bg-transparent border border-gray-300 rounded text-sm cursor-pointer transition-all hover:bg-gray-100"
                onClick={() => reset()}
              >
                <RefreshCw className="w-4 h-4 inline-block mr-1" />
                Resetuj
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden min-h-[400px]">
          {children}
        </div>
      </main>

      {showFooter && (
        <footer className="mt-auto bg-gray-100 border-t border-gray-200">
          <div className="max-w-6xl mx-auto p-4 text-center text-sm text-gray-500">
            <p>Flow App Builder &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      )}
    </div>
  );
}
