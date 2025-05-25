/// src/layout/Layout.tsx
import { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useConfig } from "../hooks";

export default function Layout({ children }: { children: ReactNode }) {
  const { config } = useParams();
  const cfgName = config || 'testApp';

  // Load app config for title and theme
  const app = useConfig<any>(cfgName, `/src/!CONFIGS/${cfgName}/app.json`);
  const title = app?.name || cfgName;
  const theme = app?.tplDir;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow p-4 flex space-x-4">
        {['main','tickets','experiments'].map(p => (
          <Link key={p} to={`/${cfgName}/${p}`} className="text-gray-600 hover:underline">
            {p}
          </Link>
        ))}
      </header>
      <main className="flex-1 p-6">
        {children}
      </main>
      <footer className="p-4 text-center text-sm text-gray-500">
        {title} • theme: {theme}
      </footer>
    </div>
  );
}