// src/views/AdminPanelView.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/_npHooks/useAuth";
import { seedFirestoreFromData } from "@/_firebase/seedFirestore";
import { useApplicationStore } from "@/hooks/useApplicationStore";
import { LoadingState } from "@/components/LoadingState";
import { getLayoutComponent } from "../tpl/templates";
import SubjectIcon from "@/components/SubjectIcon";
import {
  deleteDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/_firebase/config";

// Funkcja do usuwania aplikacji
async function deleteApplication(applicationId: string) {
  try {
    // 1. Znajdź wszystkie workspaces należące do aplikacji
    const workspacesRef = collection(db, "workspaces");
    const workspacesQuery = query(
      workspacesRef,
      where("applicationId", "==", applicationId)
    );
    const workspacesSnapshot = await getDocs(workspacesQuery);

    // 2. Dla każdego workspace, znajdź i usuń wszystkie scenariusze
    for (const workspaceDoc of workspacesSnapshot.docs) {
      const workspaceId = workspaceDoc.id;

      const scenariosRef = collection(db, "scenarios");
      const scenariosQuery = query(
        scenariosRef,
        where("workspaceId", "==", workspaceId)
      );
      const scenariosSnapshot = await getDocs(scenariosQuery);

      // 3. Dla każdego scenariusza, znajdź i usuń wszystkie węzły
      for (const scenarioDoc of scenariosSnapshot.docs) {
        const scenarioId = scenarioDoc.id;

        const nodesRef = collection(db, "nodes");
        const nodesQuery = query(
          nodesRef,
          where("scenarioId", "==", scenarioId)
        );
        const nodesSnapshot = await getDocs(nodesQuery);

        // Usuń wszystkie węzły
        const nodeDeletePromises = nodesSnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(nodeDeletePromises);

        // Usuń scenariusz
        await deleteDoc(scenarioDoc.ref);
      }

      // Usuń workspace
      await deleteDoc(workspaceDoc.ref);
    }

    // Usuń aplikację
    await deleteDoc(doc(db, "applications", applicationId));

    return true;
  } catch (error) {
    console.error("Błąd podczas usuwania aplikacji:", error);
    throw error;
  }
}

const AdminPanelView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { applications, fetchApplications, isLoading, error } =
    useApplicationStore();

  const [isSeedingData, setIsSeedingData] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<any>(null);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(
    null
  );
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Pobierz listę aplikacji przy ładowaniu strony
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Obsługa wyboru pliku JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setJsonFile(file);
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const jsonContent = JSON.parse(event.target?.result as string);
          setFileContent(jsonContent);
        } catch (err) {
          setOperationError("Nieprawidłowy format pliku JSON");
          console.error(err);
        }
      };

      reader.onerror = () => {
        setOperationError("Błąd podczas odczytu pliku");
      };

      reader.readAsText(file);
    }
  };

  // Obsługa importu danych z pliku JSON
  const handleImportData = async () => {
    if (!user) {
      setOperationError("Musisz być zalogowany, aby zaimportować dane");
      return;
    }

    if (!fileContent) {
      setOperationError("Najpierw musisz wybrać plik JSON");
      return;
    }

    setIsSeedingData(true);
    setOperationError(null);
    setSeedResult(null);

    try {
      const result = await seedFirestoreFromData(user.uid, fileContent);
      setSeedResult(result);

      // Odśwież listę aplikacji
      fetchApplications();
    } catch (err) {
      setOperationError("Wystąpił błąd podczas importu danych");
      console.error(err);
    } finally {
      setIsSeedingData(false);
    }
  };

  // Obsługa usuwania aplikacji
  const handleDeleteApplication = async (applicationId: string) => {
    if (confirmDelete !== applicationId) {
      setConfirmDelete(applicationId);
      return;
    }

    setIsDeleting(true);
    setOperationError(null);

    try {
      await deleteApplication(applicationId);
      // Odśwież listę aplikacji
      fetchApplications();
      setConfirmDelete(null);
    } catch (err) {
      setOperationError("Wystąpił błąd podczas usuwania aplikacji");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Anulowanie potwierdzenia usuwania
  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  // Obsługa nawigacji po dodaniu danych
  const handleNavigateToWorkspace = () => {
    if (seedResult) {
      if (seedResult.applicationId && seedResult.workspaceId) {
        // Nawiguj do ścieżki z aplikacją
        navigate(`/app/${seedResult.applicationId}/${seedResult.workspaceId}`);
      } else if (seedResult.workspaceId) {
        // Nawiguj bezpośrednio do workspace
        navigate(`/${seedResult.workspaceId}`);
      }
    }
  };

  // Użyj domyślnego layoutu
  const LayoutComponent =
    getLayoutComponent("default") || (() => <div>Layout Not Found</div>);

  return (
    <LoadingState
      isLoading={isLoading && !applications.length}
      error={error}
      loadingMessage="Ładowanie aplikacji..."
      errorTitle="Błąd ładowania aplikacji"
      onRetry={fetchApplications}
    >
      <LayoutComponent title="Panel administratora">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Panel administratora</h1>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
            >
              Wróć do aplikacji
            </button>
          </div>

          {/* Sekcja importu danych z JSON */}
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Import danych z pliku JSON
            </h2>
            <p className="mb-4 text-gray-600">
              Wybierz plik JSON zawierający strukturę aplikacji do
              zaimportowania.
            </p>

            <div className="mb-4">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>

            {jsonFile && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-700">
                  Wybrany plik:{" "}
                  <span className="font-semibold">{jsonFile.name}</span>
                </p>
                {fileContent && (
                  <p className="text-sm text-green-700 mt-1">
                    Plik zawiera{" "}
                    {Array.isArray(fileContent)
                      ? fileContent.length
                      : "nieznana liczba"}{" "}
                    aplikacji
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleImportData}
              disabled={isSeedingData || !fileContent || !user}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded disabled:opacity-50"
            >
              {isSeedingData
                ? "Importowanie danych..."
                : "Importuj dane z pliku"}
            </button>
          </div>

          {/* Wynik operacji */}
          {operationError && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{operationError}</p>
            </div>
          )}

          {seedResult && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-semibold mb-2">
                Dane zostały dodane pomyślnie!
              </p>
              <p className="text-sm text-green-600">
                ID aplikacji: {seedResult.applicationId}
              </p>
              <p className="text-sm text-green-600">
                ID workspace: {seedResult.workspaceId}
              </p>
              <p className="text-sm text-green-600">
                ID scenariusza: {seedResult.scenarioId}
              </p>

              <button
                onClick={handleNavigateToWorkspace}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Przejdź do dodanego workspace
              </button>
            </div>
          )}

          {/* Lista aplikacji */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Lista aplikacji</h2>

            {applications.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700">
                  Brak aplikacji w bazie danych. Zaimportuj dane z pliku JSON.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className={`p-4 border rounded-lg ${
                      selectedApplication === app.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() =>
                          setSelectedApplication(
                            app.id === selectedApplication ? null : app.id
                          )
                        }
                      >
                        <SubjectIcon
                          iconName="briefcase"
                          className="text-blue-500 mr-3"
                        />
                        <div>
                          <h3 className="font-medium">{app.name}</h3>
                          <p className="text-sm text-gray-500">
                            {app.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/app/${app.id}`)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          Otwórz
                        </button>

                        {confirmDelete === app.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDeleteApplication(app.id)}
                              disabled={isDeleting}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              {isDeleting ? "Usuwanie..." : "Potwierdź"}
                            </button>
                            <button
                              onClick={cancelDelete}
                              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                            >
                              Anuluj
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDeleteApplication(app.id)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                          >
                            Usuń
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </LayoutComponent>
    </LoadingState>
  );
};

export default AdminPanelView;
