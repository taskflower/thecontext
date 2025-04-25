// src/tpl/minimal/types.ts
import { WidgetProps } from "@/types";

// Podstawowy typ dla danych karty w CardListWidget
export interface CardItem {
  id: string;
  name: string;
  description?: string;
  count?: number;
  countLabel?: string;
  icon?: string;
  [key: string]: any; // Dla dodatkowych pól
}

// Pojedynczy element statystyk
export interface StatItem {
  label: string;
  value: string | number; 
  description?: string;
  icon?: string;
}

// Pojedynczy element metryk
export interface MetricItem {
  label: string;
  value: string | number;
  change?: number;
  prefix?: string;
  suffix?: string;
  name?: string; // Dodane dla wsparcia różnych formatów danych wejściowych
}

// Typy dla widgetów
export interface StatsWidgetProps extends WidgetProps {
  title?: string;
  description?: string;
  stats?: StatItem[];
}

export interface InfoWidgetProps extends WidgetProps {
  title?: string;
  content?: string | React.ReactNode;
  icon?: string;
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
}

export interface DataDisplayWidgetProps extends WidgetProps {
  title?: string;
  description?: string;
  type?: 'list' | 'object' | 'keyValue' | 'code';
  data?: any | Record<string, any> | any[];
  onSelect?: (key: string) => void;
}

export interface CardListWidgetProps extends WidgetProps {
  data?: CardItem[];
  onSelect?: (id: string) => void;
}

export interface MetricsWidgetProps extends WidgetProps {
  title?: string;
  metrics?: MetricItem[];
}