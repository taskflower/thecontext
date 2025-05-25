// src/themes/test/widgets/index.ts
export { default as TextFieldWidget } from './TextFieldWidget';
export { default as TextareaFieldWidget } from './TextareaFieldWidget';
export { default as SelectFieldWidget } from './SelectFieldWidget';
export { default as DateFieldWidget } from './DateFieldWidget';
export { default as NumberFieldWidget } from './NumberFieldWidget';
export { default as EmailFieldWidget } from './EmailFieldWidget';
export { default as CheckboxFieldWidget } from './CheckboxFieldWidget';

// Eksport mapy widgetów dla łatwego użycia
export const FIELD_WIDGETS = {
  text: () => import('./TextFieldWidget'),
  textarea: () => import('./TextareaFieldWidget'),
  select: () => import('./SelectFieldWidget'),
  date: () => import('./DateFieldWidget'),
  number: () => import('./NumberFieldWidget'),
  email: () => import('./EmailFieldWidget'),
  checkbox: () => import('./CheckboxFieldWidget'),
};