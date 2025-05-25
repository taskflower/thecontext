// src/themes/test/layouts/Simple.tsx
import { Link, useParams } from 'react-router-dom';

export default function Simple({ children }: any) {
  const { config } = useParams();
  const cfg = config || 'testApp';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">{cfg}</h1>
            </div>
            <nav className="flex space-x-4">
              {['main', 'tickets', 'experiments'].map((p) => (
                <Link
                  key={p}
                  to={`/${cfg}/${p}`}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">{children}</div>
      </main>
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} {cfg}. Built with Universal Engine + LLM.
          </p>
        </div>
      </footer>
    </div>
  );
}
