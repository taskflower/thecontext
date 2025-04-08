// Eksport wszystkich typów z jednego miejsca
export * from './LayoutTemplate';
export * from './WidgetTemplate';
export * from './FlowStepTemplate';

/**
 * Wspólne właściwości dla wszystkich szablonów
 */
export interface BaseTemplate {
  id: string;
  name: string;
}