/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/DatabaseConfigurator.tsx
import React, { useState, useEffect } from "react";

import {
  DatabaseConfig,
  CollectionSchema,
  initDatabase,
  addItemsToCollection,
  createDatabaseConfig,
} from "../databaseConfigurator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Database,
  PlusCircle,
  CheckCircle,
  Trash2,
  HelpCircle,
  Save,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DatabaseConfiguratorProps {
  defaultType?: "lessons" | "surveys" | "processes" | "custom";
  onConfigCreated?: (config: DatabaseConfig) => void;
}

const DatabaseConfigurator: React.FC<DatabaseConfiguratorProps> = ({
  defaultType = "lessons",
  onConfigCreated,
}) => {
  // Stan dla konfiguracji bazy danych
  const [configType, setConfigType] = useState<
    "lessons" | "surveys" | "processes" | "custom"
  >(defaultType);
  const [dbName, setDbName] = useState("");
  const [contextKey, setContextKey] = useState("");
  const [collections, setCollections] = useState<CollectionSchema[]>([]);

  // Stan dla UI
  const [activeTab, setActiveTab] = useState("config");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [newCollection, setNewCollection] = useState<CollectionSchema>({
    name: "",
  });
  const [sampleData, setSampleData] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState("");
  const [importCollection, setImportCollection] = useState("");

  // Ustaw domyślne wartości na podstawie wybranego typu
  useEffect(() => {
    const defaultConfig = createDatabaseConfig(configType, {});
    setDbName(defaultConfig.dbName);
    setContextKey(defaultConfig.contextKey);
    setCollections(defaultConfig.collections);
  }, [configType]);

  // Inicjalizacja bazy danych
  const handleInitDatabase = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const config: DatabaseConfig = {
        dbName,
        version: 1,
        contextKey,
        collections,
      };

      const result = await initDatabase(config);

      if (result) {
        setSuccess("Baza danych została zainicjalizowana pomyślnie!");
        if (onConfigCreated) {
          onConfigCreated(config);
        }
      } else {
        setError("Wystąpił błąd podczas inicjalizacji bazy danych.");
      }
    } catch (err) {
      console.error("Błąd inicjalizacji:", err);
      setError(`Błąd: ${err instanceof Error ? err.message : "Nieznany błąd"}`);
    } finally {
      setLoading(false);
    }
  };

  // Dodawanie nowej kolekcji
  const handleAddCollection = () => {
    if (!newCollection.name) {
      setError("Nazwa kolekcji jest wymagana.");
      return;
    }

    if (collections.some((c) => c.name === newCollection.name)) {
      setError("Kolekcja o takiej nazwie już istnieje.");
      return;
    }

    // Jeśli podano przykładowe dane, spróbuj je sparsować
    let parsedSampleData: unknown = undefined;
    if (sampleData) {
      try {
        parsedSampleData = JSON.parse(sampleData);
      } catch {
        setError(
          "Błąd parsowania przykładowych danych JSON. Upewnij się, że format jest poprawny."
        );
        return;
      }
    }

    // Dodaj nową kolekcję
    const collectionToAdd: CollectionSchema = {
      ...newCollection,
      sampleData: parsedSampleData,
    };

    setCollections([...collections, collectionToAdd]);
    setNewCollection({ name: "" });
    setSampleData("");
    setShowAddCollection(false);
    setSuccess(
      "Kolekcja została dodana. Pamiętaj o zainicjalizowaniu bazy danych."
    );
  };

  // Usuwanie kolekcji
  const handleRemoveCollection = (name: string) => {
    setCollections(collections.filter((c) => c.name !== name));
    setSuccess(
      "Kolekcja została usunięta. Pamiętaj o zainicjalizowaniu bazy danych."
    );
  };

  // Import danych do kolekcji
  const handleImportData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!importCollection) {
        setError("Wybierz kolekcję do importu danych.");
        return;
      }

      if (!importData) {
        setError("Dane do importu są puste.");
        return;
      }

      // Parsuj dane JSON
      let parsedData;
      try {
        parsedData = JSON.parse(importData);
      } catch {
        setError(
          "Błąd parsowania danych JSON. Upewnij się, że format jest poprawny."
        );
        setLoading(false);
        return;
      }

      // Upewnij się, że dane są tablicą
      if (!Array.isArray(parsedData)) {
        parsedData = [parsedData];
      }

      // Dodaj ID jeśli nie istnieją
      const dataWithIds = parsedData.map((item: any, index: number) => {
        if (!item.id) {
          return {
            ...item,
            id: `${importCollection}-${Date.now()}-${index}`,
          };
        }
        return item;
      });

      // Importuj dane do bazy
      const result = await addItemsToCollection(
        dbName,
        importCollection,
        dataWithIds
      );

      if (result) {
        setSuccess(
          `Zaimportowano ${dataWithIds.length} elementów do kolekcji ${importCollection}.`
        );
        setImportDialogOpen(false);
        setImportData("");
      } else {
        setError("Wystąpił błąd podczas importu danych.");
      }
    } catch (err) {
      console.error("Błąd importu:", err);
      setError(`Błąd: ${err instanceof Error ? err.message : "Nieznany błąd"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="config">Konfiguracja</TabsTrigger>
          <TabsTrigger value="collections">Kolekcje</TabsTrigger>
          <TabsTrigger value="import">Import danych</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Konfiguracja bazy danych</CardTitle>
              <CardDescription>
                Skonfiguruj bazę danych IndexedDB dla integracji z aplikacją.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Typ konfiguracji</label>
                <Select
                  value={configType}
                  onValueChange={(value: any) => setConfigType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz typ konfiguracji" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lessons">Lekcje językowe</SelectItem>
                    <SelectItem value="surveys">
                      Ankiety i formularze
                    </SelectItem>
                    <SelectItem value="processes">Procesy biznesowe</SelectItem>
                    <SelectItem value="custom">Niestandardowa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Nazwa bazy danych</label>
                <Input
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  placeholder="np. language_learning"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Klucz kontekstu</label>
                <Input
                  value={contextKey}
                  onChange={(e) => setContextKey(e.target.value)}
                  placeholder="np. lessonsDatabase"
                />
                <p className="text-xs text-muted-foreground">
                  Ten klucz będzie używany do odnoszenia się do bazy danych w
                  kontekście aplikacji.
                </p>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleInitDatabase}
                  disabled={
                    loading ||
                    !dbName ||
                    !contextKey ||
                    collections.length === 0
                  }
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inicjalizacja...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Inicjalizuj bazę danych
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Kolekcje</CardTitle>
                <CardDescription>
                  Zarządzaj kolekcjami w bazie danych.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAddCollection(true)}
                disabled={showAddCollection}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Dodaj kolekcję
              </Button>
            </CardHeader>
            <CardContent>
              {showAddCollection && (
                <div className="border rounded-lg p-4 mb-4 bg-muted/10">
                  <h3 className="text-sm font-medium mb-3">Nowa kolekcja</h3>

                  <div className="space-y-3">
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-medium">
                        Nazwa kolekcji
                      </label>
                      <Input
                        value={newCollection.name}
                        onChange={(e) =>
                          setNewCollection({
                            ...newCollection,
                            name: e.target.value,
                          })
                        }
                        placeholder="np. lessons"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-medium">
                        Przykładowe dane (opcjonalnie)
                      </label>
                      <Textarea
                        value={sampleData}
                        onChange={(e) => setSampleData(e.target.value)}
                        placeholder="Wklej przykładowy obiekt JSON..."
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        Dane będą używane jako referencja struktury i do
                        walidacji.
                      </p>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddCollection(false)}
                      >
                        Anuluj
                      </Button>
                      <Button size="sm" onClick={handleAddCollection}>
                        Dodaj kolekcję
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {collections.length === 0 ? (
                <div className="text-center p-6 border border-dashed rounded-lg">
                  <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Nie zdefiniowano jeszcze żadnych kolekcji. Dodaj kolekcję,
                    aby rozpocząć.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {collections.map((collection) => (
                    <div
                      key={collection.name}
                      className="flex items-center justify-between p-3 border rounded-lg bg-card"
                    >
                      <div>
                        <div className="flex items-center">
                          <Database className="h-4 w-4 mr-2 text-primary" />
                          <span className="font-medium">{collection.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {collection.indexes?.length ? (
                            <span>
                              Indeksy:{" "}
                              {collection.indexes.map((i) => i.name).join(", ")}
                            </span>
                          ) : (
                            <span>Brak zdefiniowanych indeksów</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {collection.sampleData ? (
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary"
                          >
                            Przykładowe dane
                          </Badge>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() =>
                            handleRemoveCollection(collection.name)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import danych</CardTitle>
              <CardDescription>
                Importuj dane do kolekcji w bazie danych.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    disabled={collections.length === 0}
                    className="w-full mb-4"
                  >
                    Importuj dane
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import danych</DialogTitle>
                    <DialogDescription>
                      Wklej dane JSON do importu do wybranej kolekcji.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm font-medium">
                        Wybierz kolekcję
                      </label>
                      <Select
                        value={importCollection}
                        onValueChange={setImportCollection}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz kolekcję" />
                        </SelectTrigger>
                        <SelectContent>
                          {collections.map((collection) => (
                            <SelectItem
                              key={collection.name}
                              value={collection.name}
                            >
                              {collection.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <label className="text-sm font-medium">Dane JSON</label>
                      <Textarea
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        placeholder="[{ ... }, { ... }]"
                        rows={10}
                      />
                      <p className="text-xs text-muted-foreground">
                        Wklej tablicę obiektów JSON lub pojedynczy obiekt.
                      </p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setImportDialogOpen(false)}
                    >
                      Anuluj
                    </Button>
                    <Button
                      onClick={handleImportData}
                      disabled={loading || !importCollection || !importData}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importowanie...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Importuj
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="bg-muted/20 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Wskazówki importu</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Dane muszą być w formacie JSON.</li>
                  <li>
                    • Każdy element powinien zawierać unikalne ID lub zostanie
                    ono wygenerowane automatycznie.
                  </li>
                  <li>• Przygotuj dane zgodnie ze strukturą kolekcji.</li>
                  <li>
                    • Import zastąpi istniejące elementy o tych samych ID.
                  </li>
                  <li>• Po imporcie odświež stronę, aby zobaczyć zmiany.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4">
            <Alert
              variant={error ? "destructive" : success ? "default" : "default"}
              className={!error && !success ? "bg-muted/20 border-border" : ""}
            >
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>
                {error ? "Błąd" : success ? "Sukces" : "Informacja"}
              </AlertTitle>
              <AlertDescription>
                {error ||
                  success ||
                  "Skonfiguruj bazę danych i zarządzaj danymi z poziomu tego panelu."}
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseConfigurator;
