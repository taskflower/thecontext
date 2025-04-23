// src/views/ApplicationView.tsx
import { useEffect, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "@/hooks/useApplicationStore";
import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/_npHooks/useAuth";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import ApplicationCard from "@/components/ApplicationCard";
import Footer from "@/components/Footer";
import SharedLoader from "@/components/SharedLoader";

export const ApplicationView: React.FC = () => {
  const {
    applications,
    fetchApplications,
    isLoading,
    error,
    selectApplication,
  } = useApplicationStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSelect = (applicationId: string) => {
    selectApplication(applicationId);
    navigate(`/app/${applicationId}`);
  };

  const fallbackLoader = <SharedLoader message="Ładowanie aplikacji..." fullScreen={true} />;

  return (
    <Suspense fallback={fallbackLoader}>
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