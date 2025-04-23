// src/views/ApplicationView.tsx
import React, { useEffect, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { getLayoutComponent, getWidgetComponent } from "../tpl/templates";
import { useApplicationStore } from "@/hooks/useApplicationStore";
import { LoadingState } from "@/components/LoadingState";
import { useAuth } from '@/_npHooks/useAuth';

export const ApplicationView: React.FC = () => {
  const { 
    applications, 
    fetchApplications, 
    isLoading, 
    error,
    selectApplication 
  } = useApplicationStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Pobierz wszystkie aplikacje przy pierwszym renderowaniu
    fetchApplications();
  }, [fetchApplications]);

  // Użyj domyślnego layoutu
  const LayoutComponent =
    getLayoutComponent("default") || (() => <div>Layout Not Found</div>);

  // Użyj card-list jako widgetu dla listy aplikacji
  const WidgetComponent =
    getWidgetComponent("card-list") || (() => <div>Widget Not Found</div>);

  // Obsługa wyboru aplikacji
  const handleSelect = (applicationId: string) => {
    selectApplication(applicationId);
    navigate(`/app/${applicationId}`);
  };

  // Przygotuj dane dla widgetu
  const applicationData = applications.map((app) => ({
    id: app.id,
    name: app.name,
    description: app.description || "Aplikacja bez opisu",
    count: app.workspaces?.length || 0,
    countLabel: "workspaces",
    icon: "briefcase"
  }));

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-slate-700 text-lg">Ładowanie aplikacji...</div>
        </div>
      }
    >
      <LoadingState
        isLoading={isLoading}
        error={error}
        loadingMessage="Ładowanie aplikacji..."
        errorTitle="Błąd ładowania aplikacji"
        onRetry={() => fetchApplications()}
      >
        <LayoutComponent title="Aplikacje">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Dostępne aplikacje</h1>
              <p className="text-gray-600">Wybierz aplikację, aby rozpocząć pracę</p>
            </div>
            
            {/* Link do panelu administratora */}
            {user && (
              <button 
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Panel administratora
              </button>
            )}
          </div>

          {applications.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-yellow-700">
                Brak dostępnych aplikacji. 
                {user ? (
                  <span> Przejdź do <button 
                    onClick={() => navigate('/admin')}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    panelu administratora
                  </button>, aby dodać dane testowe.</span>
                ) : (
                  <span> Zaloguj się, aby dodać dane testowe.</span>
                )}
              </p>
            </div>
          ) : (
            <WidgetComponent data={applicationData} onSelect={handleSelect} />
          )}
        </LayoutComponent>
      </LoadingState>
    </Suspense>
  );
};

export default ApplicationView;