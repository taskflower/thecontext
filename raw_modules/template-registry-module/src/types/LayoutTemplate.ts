import { ComponentType } from 'react';

/**
 * Props dla komponentów layout
 */
export interface LayoutProps {
  /**
   * Zawartość, która ma być wyrenderowana wewnątrz layoutu
   */
  children: React.ReactNode;
  
  /**
   * Opcjonalny tytuł strony
   */
  title?: string;
  
  /**
   * Czy pokazać przycisk powrotu
   */
  showBackButton?: boolean;
  
  /**
   * Funkcja wywoływana po kliknięciu przycisku powrotu
   */
  onBackClick?: () => void;
}

/**
 * Interfejs definiujący szablon layoutu
 */
export interface LayoutTemplate {
  /**
   * Unikalny identyfikator szablonu
   */
  id: string;
  
  /**
   * Nazwa wyświetlana szablonu
   */
  name: string;
  
  /**
   * Komponent React implementujący szablon layoutu
   */
  component: ComponentType<LayoutProps>;
}