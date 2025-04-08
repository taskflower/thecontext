/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/types.ts - nowy plik z ujednoliconymi typami

import React from 'react';
import { Node } from '@/store/types';

/**
 * Rezultat walidacji danych pluginu
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

/**
 * Ujednolicony interfejs dla pluginów węzłów
 */
export interface NodePlugin {
  // Podstawowe informacje o pluginie
  id: string;
  name: string;
  description: string;
  
  /**
   * Transformuje węzeł przed wyświetleniem użytkownikowi
   * @param node Węzeł do transformacji
   * @returns Przekształcony węzeł z dodanymi konfiguracjami
   */
  transformNode: (node: Node) => Node;
  
  /**
   * Waliduje dane konfiguracyjne pluginu
   * @param pluginData Dane konfiguracyjne
   * @returns Rezultat walidacji (isValid + opcjonalna lista błędów)
   */
  validateNodeData: (pluginData: Record<string, any>) => ValidationResult;
  
  /**
   * Renderuje formularz konfiguracyjny pluginu w edytorze węzła
   * @param pluginData Aktualne dane konfiguracyjne
   * @param onChange Funkcja wywoływana przy zmianie danych
   * @returns Element React z formularzem
   */
  renderConfigForm: (
    pluginData: Record<string, any> | undefined, 
    onChange: (newData: Record<string, any>) => void
  ) => React.ReactNode;
  
  /**
   * Renderuje komponent wejściowy w widoku flow
   * @param node Aktualny węzeł
   * @param value Aktualna wartość wejściowa
   * @param onChange Funkcja wywołania przy zmianie wartości
   * @returns Element React z komponentem wejściowym
   */
  renderInputComponent: (
    node: Node, 
    value: string, 
    onChange: (value: string) => void
  ) => React.ReactNode;
}