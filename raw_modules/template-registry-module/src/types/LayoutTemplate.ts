// src/types/LayoutTemplate.ts
// Typy szablonów układu

import { ComponentType } from 'react';
import { BaseTemplate } from './BaseTemplate';

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
export interface LayoutTemplate extends BaseTemplate {
  /**
   * Komponent React implementujący szablon layoutu
   */
  component: ComponentType<LayoutProps>;
}