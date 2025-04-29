// src/_modules/admin/AdminPanelView.tsx
import React, { useState } from 'react';
import { useAuth } from '@/hooks';
import { Navigate } from 'react-router-dom';
import AppManager from './components/AppManager';

// Definicja zakładek panelu administratora
const TABS = [
  { id: 'applications', label: 'Aplikacje' },
  { id: 'users', label: 'Użytkownicy' },
  { id: 'settings', label: 'Ustawienia' },
];

const AdminPanelView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('applications');

  // Sprawdzenie, czy użytkownik jest zalogowany
  if (!user) {
    // Redirect do strony logowania jeśli użytkownik nie jest zalogowany
    return <Navigate to="/login" state={{ from: '/admin' }} />;
  }
  
  // Panel dostępny dla wszystkich zalogowanych użytkowników

  // Renderowanie zawartości wybranej zakładki
  const renderTabContent = () => {
    switch (activeTab) {
      case 'applications':
        return <AppManager />;
      case 'users':
        return (
          <div className="p-6 border border-slate-200 rounded-lg bg-white">
            <h3 className="text-xl font-semibold mb-4">Zarządzanie użytkownikami</h3>
            <p className="text-slate-600">Ta funkcjonalność jest w trakcie implementacji.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6 border border-slate-200 rounded-lg bg-white">
            <h3 className="text-xl font-semibold mb-4">Ustawienia systemowe</h3>
            <p className="text-slate-600">Ta funkcjonalność jest w trakcie implementacji.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nagłówek panelu */}
      <header className="bg-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Panel administratora</h1>
            <span className="text-xs px-2 py-1 bg-green-600 rounded-full">v1.0</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="opacity-75">Zalogowany jako:</span> {user.email}
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded transition-colors"
            >
              Powrót do aplikacji
            </button>
          </div>
        </div>
      </header>

      {/* Główna zawartość */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Zakładki */}
        <div className="mb-6 border-b border-slate-200">
          <nav className="flex space-x-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 font-medium text-sm border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Zawartość zakładki */}
        {renderTabContent()}
      </main>

      {/* Stopka */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} EduGo.ai - Panel administratora
        </div>
      </footer>
    </div>
  );
};

export default AdminPanelView;