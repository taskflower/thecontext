// src/modules/filters/hooks/useFilters.ts
import { useState, useCallback, useMemo } from "react";
import { useAppStore } from "../../store";
import { Filter, FilterActionParams } from "../types";

/**
 * Hook udostępniający zunifikowane API dla pracy z filtrami
 * Centralizuje logikę filtrowania, jednocześnie wykorzystując Zustand jako podstawę przechowywania stanu
 */
export function useFilters(scenarioId?: string) {
  // Stan UI - przechowywany lokalnie w hooku
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingFilter, setEditingFilter] = useState<Filter | null>(null);
  
  // Dostęp do akcji ze store'a Zustand
  const getScenarioFilters = useAppStore(state => state.getScenarioFilters);
  const addScenarioFilter = useAppStore(state => state.addScenarioFilter);
  const updateScenarioFilter = useAppStore(state => state.updateScenarioFilter);
  const deleteScenarioFilter = useAppStore(state => state.deleteScenarioFilter);
  const toggleScenarioFilter = useAppStore(state => state.toggleScenarioFilter);
  const checkScenarioFilterMatch = useAppStore(state => state.checkScenarioFilterMatch);
  const getContextItems = useAppStore(state => state.getContextItems);
  
  // Wymuszenie aktualizacji przy zmianie stateVersion w Zustand
  const stateVersion = useAppStore(state => state.stateVersion);
  
  // Memoizowane filtry dla bieżącego scenariusza
  const filters = useMemo(() => {
    return getScenarioFilters(scenarioId);
  }, [getScenarioFilters, scenarioId, stateVersion]);
  
  // Pomocnicze obliczenia
  const activeFilters = useMemo(() => {
    return filters.filter(f => f.enabled);
  }, [filters]);
  
  const filtersMatch = useMemo(() => {
    return checkScenarioFilterMatch(scenarioId);
  }, [checkScenarioFilterMatch, scenarioId, stateVersion]);
  
  // Elementy kontekstu potrzebne do dialogów
  const contextItems = useMemo(() => {
    return getContextItems(scenarioId);
  }, [getContextItems, scenarioId, stateVersion]);
  
  // Funkcje obsługi interfejsu użytkownika
  const toggleMenu = useCallback((id: string) => {
    setMenuOpen(prev => prev === id ? null : id);
  }, []);
  
  const handleEditFilter = useCallback((filter: Filter) => {
    setEditingFilter(filter);
    setMenuOpen(null);
  }, []);
  
  const handleDeleteFilter = useCallback((id: string) => {
    deleteScenarioFilter(id, scenarioId);
    setMenuOpen(null);
  }, [deleteScenarioFilter, scenarioId]);
  
  const handleToggleFilter = useCallback((id: string) => {
    toggleScenarioFilter(id, scenarioId);
  }, [toggleScenarioFilter, scenarioId]);
  
  const clearEditingFilter = useCallback(() => {
    setEditingFilter(null);
  }, []);
  
  // Funkcje opakowujące Zustand dla dodawania/aktualizacji filtrów
  const handleAddFilter = useCallback((filterData: FilterActionParams) => {
    addScenarioFilter(filterData, scenarioId);
  }, [addScenarioFilter, scenarioId]);
  
  const handleUpdateFilter = useCallback((id: string, filterData: Partial<FilterActionParams>) => {
    updateScenarioFilter(id, filterData, scenarioId);
    setEditingFilter(null);
  }, [updateScenarioFilter, scenarioId]);
  
  // Eksport wszystkich potrzebnych wartości i funkcji
  return {
    // Stan z Zustand
    filters,
    activeFilters,
    filtersMatch,
    hasActiveFilters: activeFilters.length > 0,
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