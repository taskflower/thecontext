// src/views/ApplicationView.tsx
import { useEffect, Suspense } from "react";
import { LoadingState } from "@/components/LoadingState";
import Header from "@/components/homeLayout/Header";
import EmptyState from "@/components/EmptyState";
import ApplicationCard from "@/components/homeLayout/ApplicationCard";
import Footer from "@/components/homeLayout/Footer";
import SharedLoader from "@/components/SharedLoader";
import { useAuth } from "@/hooks";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/useAppStore";

export const ApplicationView: React.FC = () => {
  const { fetchApplications, selectApplication, error } = useAppStore();
  const applications = useAppStore((state) => state.data.applications);
  const isLoading = useAppStore((state) => state.loading.application);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Ładowanie aplikacji
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Obsługa wyboru
  const handleSelect = (applicationId: string) => {
    selectApplication(applicationId);
    navigate(`/app/${applicationId}`);
  };

  return (
    <Suspense fallback={<SharedLoader message="Ładowanie aplikacji..." fullScreen={true} />}>
      <LoadingState
        isLoading={isLoading}
        error={error}
        loadingMessage="Ładowanie aplikacji..."
        errorTitle="Błąd ładowania aplikacji"
        onRetry={() => fetchApplications()}
      >
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <main className="max-w-6xl w-full py-12 px-4 md:px-6 mx-auto flex-1">
            <Header />

            <div className="space-y-8">
              {applications.length === 0 ? (
                <EmptyState user={user} />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {applications.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      app={{
                        id: app.id,
                        name: app.name,
                        description: app.description || "Aplikacja bez opisu",
                      }}
                      onClick={() => handleSelect(app.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>

          <Footer user={user} />
        </div>
      </LoadingState>
    </Suspense>
  );
};

export default ApplicationView;