/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType } from 'react';

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
export interface WidgetTemplate {
  /**
   * Unikalny identyfikator widgetu
   */
  id: string;
  
  /**
   * Nazwa wyświetlana widgetu
   */
  name: string;
  
  /**
   * Kategoria widgetu
   */
  category: WidgetCategory;
  
  /**
   * Komponent React implementujący szablon widgetu
   */
  component: ComponentType<WidgetProps>;
}