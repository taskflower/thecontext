// src/types/WidgetTemplate.ts
// Typy szablonów widgetów

import { ComponentType } from 'react';
import { BaseTemplate } from './BaseTemplate';

/**
 * Kategorie widgetów
 */
export type WidgetCategory = 'scenario' | 'workspace' | 'flow';

/**
 * Props dla komponentów widget
 */
export interface WidgetProps {
  /**
   * Dane do wyświetlenia w widgecie
   */
  data?: any[];
  
  /**
   * Funkcja wywoływana po wybraniu elementu
   */
  onSelect?: (id: string) => void;
  
  /**
   * Funkcja wywoływana po utworzeniu nowego elementu
   */
  onCreate?: (data: any) => void;
  
  /**
   * Funkcja wywoływana po kliknięciu przycisku edycji
   */
  onEdit?: (id: string, event: React.MouseEvent) => void;
}

/**
 * Interfejs definiujący szablon widgetu
 */
export interface WidgetTemplate extends BaseTemplate {
  /**
   * Kategoria widgetu
   */
  category: WidgetCategory;
  
  /**
   * Komponent React implementujący szablon widgetu
   */
  component: ComponentType<WidgetProps>;
}
