# Przewodnik implementacji standaryzacji systemu filtrów

## Wprowadzenie

Ten dokument zawiera instrukcje dotyczące implementacji ujednoliconego podejścia do systemu filtrów w aplikacji. Nowa implementacja łączy zalety obydwu istniejących podejść - komponenty UI oraz zarządzanie stanem za pomocą Zustand, jednocześnie wprowadzając czytelny i jednolity sposób korzystania z filtrów poprzez dedykowany hook `useFilters`.

## Kluczowe korzyści

1. **Centralizacja logiki** - Cała logika filtrowania jest dostępna przez hook `useFilters`
2. **Zachowanie stanu w Zustand** - Dane filtrów nadal są persystowane w store'ze Zustand
3. **Uproszczenie komponentów UI** - Komponenty koncentrują się na prezentacji, a nie logice
4. **Łatwiejsze testowanie** - Możliwość testowania logiki filtrowania niezależnie od UI
5. **Spójne API** - Wszystkie komponenty korzystają z tego samego interfejsu

## Struktura modułu filtrów

```
src/modules/filters/
├── components/              # Komponenty UI
│   ├── FilterDialog.tsx     # Dialog dodawania filtra
│   ├── EditFilterDialog.tsx # Dialog edycji filtra
│   ├── FilterItem.tsx       # Element listy filtrów
│   ├── FiltersList.tsx      # Lista filtrów
│   ├── FilterStatus.tsx     # Wskaźnik statusu filtrów
│   └── FilterStatusBanner.tsx # Pasek statusu filtrów
├── hooks/
│   └── useFilters.ts        # Główny hook z logiką filtrowania
├── filterActions.ts         # Akcje Zustand
├── index.ts                 # Eksport publicznego API modułu
└── types.ts                 # Definicje typów
```

## Instrukcje implementacji

### Krok 1: Zaktualizuj moduł typów

Rozpocznij od aktualizacji modułu `types.ts` o nowe interfejsy i typy.

### Krok 2: Stwórz hook `useFilters`

Zaimplementuj główny hook `useFilters.ts` w katalogu `hooks/`, który będzie służył jako centralne miejsce dla logiki filtrowania:

```typescript
// src/modules/filters/hooks/useFilters.ts
import { useState, useCallback, useMemo } from "react";
import { useAppStore } from "../../store";
import { Filter, FilterActionParams } from "../types";

export function useFilters(scenarioId?: string) {
  // Stan UI
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingFilter, setEditingFilter] = useState<Filter | null>(null);
  
  // Dostęp do akcji ze store'a Zustand
  const getScenarioFilters = useAppStore(state => state.getScenarioFilters);
  // ... pozostałe akcje
  
  // Wymuszenie aktualizacji przy zmianie stateVersion w Zustand
  const stateVersion = useAppStore(state => state.stateVersion);
  
  // Funkcje pomocnicze
  // ...
  
  return {
    // Stan z Zustand
    filters,
    activeFilters,
    filtersMatch,
    hasActiveFilters,
    contextItems,
    
    // Stan lokalny UI
    menuOpen,
    editingFilter,
    
    // Funkcje akcji
    toggleMenu,
    handleEditFilter,
    handleDeleteFilter,
    handleToggleFilter,
    clearEditingFilter,
    handleAddFilter,
    handleUpdateFilter,
  };
}
```

### Krok 3: Aktualizacja komponentów

Zaktualizuj komponenty UI, aby korzystały z hooka `useFilters` zamiast bezpośredniego dostępu do store'a:

#### FiltersList.tsx
```typescript
const FiltersList: React.FC<FiltersListProps> = ({ scenarioId }) => {
  const {
    filters,
    // ... pozostałe wartości i funkcje
  } = useFilters(scenarioId);
  
  // ...
}
```

#### FilterStatus.tsx
```typescript
export const FilterStatus: React.FC<FilterStatusProps> = ({ onClick, className, scenarioId }) => {
  const { activeFilters, filtersMatch } = useFilters(scenarioId);
  // ...
}
```

### Krok 4: Ujednolicenie API filtrów

Zaktualizuj `filterActions.ts`, aby zapewnić spójny interfejs dla hooka `useFilters`:

```typescript
export const createFilterSlice: StateCreator<
  AppState,
  [["zustand/immer", never]],
  [],
  FilterActions
> = (set, get) => ({
  // Funkcje filtru
  // ...
  
  // Nowa funkcja pomocnicza do ewaluacji pojedynczego filtra
  evaluateFilter: (filter: Filter, contextItems: ContextItem[]): boolean => {
    // ...
  },
  
  checkScenarioFilterMatch: (scenarioId?) => {
    // ...
    return activeFilters.every(filter => 
      state.evaluateFilter(filter, contextItems)
    );
  }
})
```

### Krok 5: Aktualizacja eksportów

Zaktualizuj plik `index.ts`, aby eksportował nowy hook i komponenty:

```typescript
export * from "./types";
export * from "./filterActions";
export { default as FiltersList } from "./components/FiltersList";
// ... pozostałe eksporty komponentów

// Eksport hooka do wykorzystania w innych modułach
export { useFilters } from "./hooks/useFilters";
```

## Przykłady użycia

### Podstawowe użycie w komponencie

```typescript
import React from "react";
import { useFilters } from "../filters/hooks/useFilters";

const ScenarioFilters: React.FC = () => {
  const scenarioId = useAppStore(state => state.selected.scenario);
  const { filters, activeFilters, filtersMatch } = useFilters(scenarioId);
  
  return (
    <div>
      <h2>Filtry scenariusza</h2>
      {activeFilters.length > 0 && (
        <div className={filtersMatch ? "success" : "warning"}>
          {filtersMatch ? "Wszystkie filtry spełnione" : "Niektóre filtry niespełnione"}
        </div>
      )}
      
      {/* Wyświetl listę filtrów */}
    </div>
  );
};
```

### Tworzenie nowego filtra

```typescript
import { useFilters } from "../filters/hooks/useFilters";
import { FilterOperator } from "../filters/types";

const AddFilterButton: React.FC = () => {
  const { handleAddFilter } = useFilters();
  
  const addExampleFilter = () => {
    handleAddFilter({
      name: "Przykładowy filtr",
      contextKey: "exampleKey",
      operator: FilterOperator.EQUALS,
      value: "exampleValue"
    });
  };
  
  return <button onClick={addExampleFilter}>Dodaj filtr</button>;
};
```

## Testowanie

Dzięki oddzieleniu logiki od prezentacji, możliwe jest łatwiejsze testowanie:

```typescript
// Przykładowy test dla funkcji evaluateFilter
test('evaluateFilter poprawnie ewaluuje filtr EQUALS', () => {
  const filter = {
    id: '1',
    name: 'Test',
    contextKey: 'testKey',
    operator: FilterOperator.EQUALS,
    value: 'testValue',
    enabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  const contextItems = [{
    id: '1',
    title: 'testKey',
    content: 'testValue',
    type: ContextType.TEXT,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }];
  
  const result = evaluateFilter(filter, contextItems);
  expect(result).toBe(true);
});
```

## Podsumowanie

Nowa implementacja systemu filtrów zapewnia lepszą organizację kodu, redukuje duplikację i utrzymuje korzyści wynikające z używania Zustand do zarządzania stanem. Wszystkie komponenty korzystają teraz z ujednoliconego interfejsu zapewnianego przez hook `useFilters`, co znacznie upraszcza dodawanie nowych funkcjonalności i utrzymanie kodu.