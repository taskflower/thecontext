// src/modules/context/components/ContextsList.tsx
import React, { useState } from "react";
import { PlusCircle, FilterIcon, Database } from "lucide-react";
import { useAppStore } from "../../store";
import { ContextItem, ContextType } from "../types";
import ContextItemComponent from "./ContextItemComponent";
import { AddNewContext } from "./AddNewContext";
import { EditContext } from "./EditContext";
import { ViewContext } from "./ViewContext";
import FilterStatusBanner from "../../filters/components/FilterStatusBanner";
import DatabaseConfiguratorTab from "./DatabaseConfiguratorTab";

// Interfejs dla komponentu listy kontekstów
interface ContextsListProps {
  scenarioId?: string; // Opcjonalne ID scenariusza, aby filtrować konteksty
  showScoped?: boolean; // Czy pokazywać konteksty powiązane ze scenariuszami
  onOpenDatabaseConfigurator?: () => void; // Funkcja do otwierania konfiguratora baz danych
}

const ContextsList: React.FC<ContextsListProps> = ({ 
  scenarioId,
  onOpenDatabaseConfigurator
}) => {
  const getContextItems = useAppStore((state) => state.getContextItems);
  const deleteContextItem = useAppStore((state) => state.deleteContextItem);
  const updateContextItem = useAppStore((state) => state.updateContextItem);

  const currentScenario = useAppStore(state => state.getCurrentScenario());
  const currentScenarioId = currentScenario?.id;

  // Wymuszenie aktualizacji przy zmianie stanu
  useAppStore(state => state.stateVersion);
  
  // Pobierz konteksty, opcjonalnie filtrując po scenariuszu
  const allContextItems = getContextItems();
  
  // Filtruj konteksty w zależności od ustawień
  const contextItems = allContextItems.filter(item => {
    if (scenarioId) {
      return !item.scenarioId || item.scenarioId === scenarioId;
    }
    return true;
  });
  
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  
  // Stany modali
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDbConfigOpen, setIsDbConfigOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  
  // Stany filtrów
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const toggleMenu = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  const handleEditItem = (item: ContextItem) => {
    setSelectedItemId(item.id);
    setIsEditDialogOpen(true);
    setMenuOpen(null);
  };

  const handleViewItem = (item: ContextItem) => {
    setSelectedItemId(item.id);
    setIsViewDialogOpen(true);
    setMenuOpen(null);
  };

  const handleDeleteItem = (id: string) => {
    deleteContextItem(id);
    setMenuOpen(null);
  };

  // Funkcja do czyszczenia wartości kontekstu
  const handleClearValue = (id: string) => {
    updateContextItem(id, { content: "" });
    setMenuOpen(null);
  };
  
  // Filtrowanie kontekstów
  const filteredItems = contextItems.filter(item => {
    // Filtruj po typie
    if (filterType !== "all" && item.type !== filterType) {
      return false;
    }
    
    // Filtruj po wyszukiwaniu
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Sprawdź czy są aktywne filtry
  const hasActiveFilters = useAppStore(state => {
    const filters = state.getScenarioFilters(currentScenarioId);
    return filters.some(f => f.enabled);
  });
  
  // Sprawdź czy filtry pasują
  const filtersMatch = useAppStore(state => 
    state.checkScenarioFilterMatch(currentScenarioId)
  );

  return (
    <div className="h-full flex flex-col">
      {/* Nagłówek elementów kontekstu */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-base font-medium">Kontekst</h2>
        <div className="flex gap-1">
          <button
            onClick={() => setIsDbConfigOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Konfigurator bazy danych"
            title="Otwórz konfigurator bazy danych"
          >
            <Database className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Dodaj element kontekstu"
            title="Dodaj element kontekstu"
          >
            <PlusCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Status filtrów */}
      {hasActiveFilters && (
        <FilterStatusBanner
          filtersMatch={filtersMatch}
          activeFiltersCount={
            useAppStore(state => 
              state.getScenarioFilters(currentScenarioId).filter(f => f.enabled).length
            )
          }
        />
      )}
      
      {/* Pasek filtrów */}
      <div className="px-4 py-2 border-b border-border bg-muted/10 flex flex-col space-y-2">
        {/* Wyszukiwarka */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Szukaj kontekstu..."
          className="w-full px-3 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        
        {/* Filtr typów */}
        <div className="flex items-center space-x-1 text-xs">
          <FilterIcon className="h-3 w-3 text-muted-foreground mr-1" />
          <button
            onClick={() => setFilterType("all")}
            className={`px-2 py-1 rounded-md ${filterType === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            Wszystkie
          </button>
          <button
            onClick={() => setFilterType(ContextType.TEXT)}
            className={`px-2 py-1 rounded-md ${filterType === ContextType.TEXT ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200" : "hover:bg-muted"}`}
          >
            Tekst
          </button>
          <button
            onClick={() => setFilterType(ContextType.JSON)}
            className={`px-2 py-1 rounded-md ${filterType === ContextType.JSON ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200" : "hover:bg-muted"}`}
          >
            JSON
          </button>
          <button
            onClick={() => setFilterType(ContextType.MARKDOWN)}
            className={`px-2 py-1 rounded-md ${filterType === ContextType.MARKDOWN ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" : "hover:bg-muted"}`}
          >
            Markdown
          </button>
          <button
            onClick={() => setFilterType(ContextType.INDEXED_DB)}
            className={`px-2 py-1 rounded-md ${filterType === ContextType.INDEXED_DB ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200" : "hover:bg-muted"}`}
          >
            IndexedDB
          </button>
        </div>
      </div>

      {/* Lista elementów kontekstu */}
      <div className="flex-1 overflow-auto p-2">
        {filteredItems.length > 0 ? (
          <ul className="space-y-0.5">
            {filteredItems.map((item: ContextItem) => (
              <ContextItemComponent
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onClearValue={handleClearValue}
                menuOpen={menuOpen === item.id}
                toggleMenu={() => toggleMenu(item.id)}
                onClick={handleViewItem}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            <p className="text-sm">Brak elementów kontekstu</p>
            {searchQuery || filterType !== "all" ? (
              <p className="text-xs mt-1">Spróbuj zmienić kryteria filtrowania</p>
            ) : (
              <p className="text-xs mt-1">
                Dodaj elementy kontekstu, aby wspomóc przepływ pracy
              </p>
            )}
          </div>
        )}
      </div>

      {/* Dialog dodawania elementu kontekstu */}
      <AddNewContext 
        isOpen={isAddDialogOpen} 
        setIsOpen={setIsAddDialogOpen} 
        scenarioId={scenarioId}
        onOpenDatabaseConfigurator={() => setIsDbConfigOpen(true)}
      />

      {/* Dialog edycji elementu kontekstu */}
      <EditContext
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        contextItemId={selectedItemId}
        onOpenDatabaseConfigurator={() => setIsDbConfigOpen(true)}
      />

      {/* Dialog podglądu elementu kontekstu */}
      <ViewContext
        isOpen={isViewDialogOpen}
        setIsOpen={setIsViewDialogOpen}
        contextItemId={selectedItemId}
      />
      
      {/* Dialog konfiguratora bazy danych */}
      <DatabaseConfiguratorTab 
        isOpen={isDbConfigOpen}
        onClose={() => {
          setIsDbConfigOpen(false);
          // Odświeżenie listy kolekcji po zamknięciu konfiguratora
          if (onOpenDatabaseConfigurator) {
            onOpenDatabaseConfigurator();
          }
        }}
      />
    </div>
  );
};

export default ContextsList;