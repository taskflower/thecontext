// src/themes/clean/layouts/Simple.tsx
import React from "react";
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
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {showHeader && (
        <header className="sticky top-0 z-10">
          <div className="flex justify-between items-center max-w-6xl mx-auto px-6 py-4">
            <Link to="/" className="flex items-center gap-2">
              <h1 className="m-0 text-xl font-semibold text-slate-800">
                {title}
              </h1>
            </Link>
          </div>
          <hr className="mt-0 mb-0" />
        </header>
      )}

      <main className="flex-1 w-full max-w-6xl mx-auto py-6 md:py-8 px-4 flex flex-col">
        <div className="flex-1 min-h-[400px]">
          {children}
        </div>
      </main>

      {showFooter && (
        <footer className="mt-auto">
          <hr className="mt-4 mb-4" />
          <div className="max-w-6xl mx-auto px-6 py-4 text-center text-sm text-gray-500">
            <p>Flow App Builder &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      )}
    </div>
  );
}