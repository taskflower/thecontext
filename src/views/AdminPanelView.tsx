// src/views/AdminPanelView.tsx
import { useState, useEffect } from "react";
import { seedFirestoreFromData } from "@/_firebase/seedFirestore";
import { LoadingState } from "@/components/LoadingState";
import SharedLoader from "@/components/SharedLoader";
import {
  deleteDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/_firebase/config";
import Footer from "@/components/Footer";
import ApplicationList from "@/components/ApplicationList";
import AdminHeader from "@/components/AdminHeader";
import FileUpload from "@/components/FileUpload";
import StatusMessage from "@/components/StatusMessage";
import { useApplicationStore, useAuth } from "@/hooks";
import { useNavigate } from "react-router-dom";

// Function to delete an application
async function deleteApplication(applicationId: string) {
  try {
    // 1. Find all workspaces belonging to this application
    const workspacesRef = collection(db, "workspaces");
    const workspacesQuery = query(
      workspacesRef,
      where("applicationId", "==", applicationId)
    );
    const workspacesSnapshot = await getDocs(workspacesQuery);

    // 2. For each workspace, find and delete all scenarios
    for (const workspaceDoc of workspacesSnapshot.docs) {
      const workspaceId = workspaceDoc.id;

      const scenariosRef = collection(db, "scenarios");
      const scenariosQuery = query(
        scenariosRef,
        where("workspaceId", "==", workspaceId)
      );
      const scenariosSnapshot = await getDocs(scenariosQuery);

      // 3. For each scenario, find and delete all nodes
      for (const scenarioDoc of scenariosSnapshot.docs) {
        const scenarioId = scenarioDoc.id;

        const nodesRef = collection(db, "nodes");
        const nodesQuery = query(
          nodesRef,
          where("scenarioId", "==", scenarioId)
        );
        const nodesSnapshot = await getDocs(nodesQuery);

        // Delete all nodes
        const nodeDeletePromises = nodesSnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(nodeDeletePromises);

        // Delete scenario
        await deleteDoc(scenarioDoc.ref);
      }

      // Delete workspace
      await deleteDoc(workspaceDoc.ref);
    }

    // Delete application
    await deleteDoc(doc(db, "applications", applicationId));

    return true;
  } catch (error) {
    console.error("Error deleting application:", error);
    throw error;
  }
}

const AdminPanelView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { applications, fetchApplications, isLoading, error } =
    useApplicationStore();

  const [isSeedingData, setIsSeedingData] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [seedResult, setSeedResult] = useState<{ applicationId: string; workspaceId: string; scenarioId: string; } | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Fetch applications on load
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setJsonFile(file);
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const jsonContent = JSON.parse(event.target?.result as string);
          setFileContent(jsonContent);
        } catch (err: any) {
          setOperationError(`Invalid JSON format: ${err.message}`);
          console.error(err);
        }
      };

      reader.onerror = () => {
        setOperationError("Error reading file");
      };

      reader.readAsText(file);
    }
  };

  // Handle data import from JSON
  const handleImportData = async () => {
    if (!user) {
      setOperationError("You must be logged in to import data");
      return;
    }

    if (!fileContent) {
      setOperationError("You must select a JSON file first");
      return;
    }

    setIsSeedingData(true);
    setOperationError(null);
    setSeedResult(null);

    try {
      const result = await seedFirestoreFromData(user.uid, fileContent);
      setSeedResult(result);

      // Refresh applications
      fetchApplications();
    } catch (err) {
      setOperationError("Error occurred during data import");
      console.error(err);
    } finally {
      setIsSeedingData(false);
    }
  };

  // Handle application deletion
  const handleDeleteApplication = async (applicationId: string) => {
    if (confirmDelete !== applicationId) {
      setConfirmDelete(applicationId);
      return;
    }

    setIsDeleting(true);
    setOperationError(null);

    try {
      await deleteApplication(applicationId);
      // Refresh application list
      fetchApplications();
      setConfirmDelete(null);
    } catch (err) {
      setOperationError("Error occurred while deleting application");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel delete confirmation
  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  // Navigate to workspace after adding data
  const handleNavigateToWorkspace = () => {
    if (seedResult) {
      if (seedResult.applicationId && seedResult.workspaceId) {
        navigate(`/app/${seedResult.applicationId}/${seedResult.workspaceId}`);
      } else if (seedResult.workspaceId) {
        navigate(`/${seedResult.workspaceId}`);
      }
    }
  };

  // Render loading state for data seeding
  const renderSeedingLoader = () => {
    if (isSeedingData) {
      return <SharedLoader message="Importowanie danych..." size="md" />;
    }
    return null;
  };

  // Render loading state for deletion
  const renderDeletingLoader = () => {
    if (isDeleting) {
      return <SharedLoader message="Usuwanie aplikacji..." size="md" />;
    }
    return null;
  };

  return (
    <LoadingState
      isLoading={isLoading && !applications.length}
      error={error}
      loadingMessage="Ładowanie aplikacji..."
      errorTitle="Błąd ładowania aplikacji"
      onRetry={fetchApplications}
    >
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <main className="max-w-6xl w-full py-8 px-4 md:px-6 mx-auto flex-1">
          <AdminHeader />

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <FileUpload
              onFileChange={handleFileChange}
              jsonFile={jsonFile}
              fileContent={fileContent}
              onImport={handleImportData}
              isSeedingData={isSeedingData}
              isDisabled={!fileContent || !user}
            />

            {renderSeedingLoader()}
            {renderDeletingLoader()}

            <StatusMessage
              error={operationError}
              success={seedResult}
              onNavigate={handleNavigateToWorkspace}
            />
          </div>

          <ApplicationList
            applications={applications}
            selectedApplication={selectedApplication}
            setSelectedApplication={setSelectedApplication}
            confirmDelete={confirmDelete}
            handleDeleteApplication={handleDeleteApplication}
            cancelDelete={cancelDelete}
            isDeleting={isDeleting}
          />
        </main>

        <Footer user={user} />
      </div>
    </LoadingState>
  );
};

export default AdminPanelView;