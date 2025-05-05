// src/_modules/admin/components/AppManager.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import { applicationService, importService } from "@/_firebase/services";
import { Application } from "@/types";

const AppManager: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);

  const { user } = useAuth();

  // Pobieranie listy aplikacji
  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const appList = await applicationService.getAll();
      setApplications(appList);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Nie udało się pobrać listy aplikacji");
    } finally {
      setIsLoading(false);
    }
  };

  // Ładowanie listy przy montowaniu komponentu
  useEffect(() => {
    fetchApplications();
  }, []);

  // Obsługa przesyłania pliku JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setJsonFile(file);
    setUploadSuccess(null);
  };

  // Obsługa importu danych z JSON
  const handleImport = async () => {
    if (!jsonFile || !user) return;

    try {
      setIsUploading(true);
      setError(null);
      setUploadSuccess(null);

      // Czytanie zawartości pliku
      const fileContent = await jsonFile.text();
      const jsonData = JSON.parse(fileContent);

      // Sprawdzenie czy dane mają poprawny format
      if (!Array.isArray(jsonData)) {
        throw new Error(
          "Niepoprawny format danych. Oczekiwana tablica aplikacji."
        );
      }

      // Import danych do Firebase
      const result = await importService.seedFirestoreFromData(
        user.uid,
        jsonData
      );

      setUploadSuccess(
        `Pomyślnie zaimportowano dane. ID aplikacji: ${result.applicationId}`
      );

      // Odświeżenie listy aplikacji
      await fetchApplications();
    } catch (err) {
      console.error("Error importing data:", err);
      setError(
        `Błąd importu: ${err instanceof Error ? err.message : "Nieznany błąd"}`
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Usuwanie aplikacji
  const handleDeleteApp = async (appId: string) => {
    if (
      !user ||
      !confirm(
        "Czy na pewno chcesz usunąć tę aplikację i wszystkie powiązane dane?"
      )
    ) {
      return;
    }

    try {
      setDeleteInProgress(appId);

      // Używamy naszego serwisu do usunięcia aplikacji wraz z powiązanymi danymi
      await applicationService.delete(appId);

      // Odśwież listę
      await fetchApplications();
    } catch (err) {
      console.error("Error deleting application:", err);
      setError(
        `Błąd usuwania: ${err instanceof Error ? err.message : "Nieznany błąd"}`
      );
    } finally {
      setDeleteInProgress(null);
    }
  };

  // Formatowanie daty
  const formatDate = (date: Date) => {
    return date.toLocaleString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Zarządzanie aplikacjami</h2>
        <button
          onClick={fetchApplications}
          className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Ładowanie..." : "Odśwież"}
        </button>
      </div>

      {/* Sekcja importu */}
      <div className="p-6 border border-slate-200 rounded-lg bg-white">
        <h3 className="text-xl font-semibold mb-4">Import aplikacji z JSON</h3>

        <div className="flex gap-4 items-center">
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="flex-1 border border-slate-300 rounded-md p-2"
            disabled={isUploading}
          />

          <button
            onClick={handleImport}
            disabled={!jsonFile || isUploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isUploading ? "Importowanie..." : "Importuj dane"}
          </button>
        </div>

        {uploadSuccess && (
          <div className="mt-3 p-3 bg-green-50 text-green-700 border border-green-200 rounded">
            {uploadSuccess}
          </div>
        )}
      </div>

      {/* Komunikat o błędzie */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Lista aplikacji */}
      <div className="p-6 border border-slate-200 rounded-lg bg-white">
        <h3 className="text-xl font-semibold mb-4">Lista aplikacji</h3>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center p-8 text-slate-500">
            Brak aplikacji w bazie danych
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Nazwa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Opis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Data utworzenia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Utworzono przez
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {app.name}
                      </div>
                      <div className="text-xs text-slate-500">ID: {app.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      {app.description || "Brak opisu"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(app.createdAt ?? new Date())}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap truncate max-w-[200px]">
                      {app.createdBy || "Nieznany"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        disabled={deleteInProgress === app.id}
                        className="text-red-600 hover:text-red-900 disabled:text-red-300 disabled:cursor-not-allowed"
                      >
                        {deleteInProgress === app.id ? "Usuwanie..." : "Usuń"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppManager;
