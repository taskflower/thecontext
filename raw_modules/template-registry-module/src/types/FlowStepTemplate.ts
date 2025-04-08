/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType } from 'react';

/**
 * Props dla komponentów kroków przepływu
 */
export interface FlowStepProps {
  /**
   * Dane węzła
   */
  node: any;
  
  /**
   * Funkcja wywoływana po zatwierdzeniu danych przez użytkownika
   */
  onSubmit: (input: string) => void;
  
  /**
   * Funkcja wywoływana po kliknięciu przycisku poprzedni
   */
  onPrevious: () => void;
  
  /**
   * Czy to ostatni krok w przepływie
   */
  isLastNode: boolean;
  
  /**
   * Elementy kontekstu dostępne dla kroku
   */
  contextItems?: any[];
}

/**
 * Interfejs definiujący szablon kroku przepływu
 */
export interface FlowStepTemplate {
  /**
   * Unikalny identyfikator szablonu
   */
  id: string;
  
  /**
   * Nazwa wyświetlana szablonu
   */
  name: string;
  
  /**
   * Komponent React implementujący szablon kroku przepływu
   */
  component: ComponentType<FlowStepProps>;
  
  /**
   * Typy węzłów, z którymi szablon jest kompatybilny
   */
  compatibleNodeTypes: string[];
}