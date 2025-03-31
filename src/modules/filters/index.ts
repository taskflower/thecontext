// src/modules/filters/index.ts
export * from "./types";
export * from "./filterActions";
export { default as FiltersList } from "./components/FiltersList";
export { default as FilterItem } from "./components/FilterItem";
export { default as FilterDialog } from "./components/FilterDialog";
export { default as EditFilterDialog } from "./components/EditFilterDialog";
export { default as FilterStatus } from "./components/FilterStatus";
export { default as FilterStatusBanner } from "./components/FilterStatusBanner";

// Eksport hooka do wykorzystania w innych modułach
export { useFilters } from "./hooks/useFilters";