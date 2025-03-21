/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

export interface Field {
  name: string;
  placeholder: string;
  type?: string;
  options?: { value: string; label: string }[];
}

export interface DialogProps {
  title: string;
  onClose: () => void;
  onAdd: () => void;
  fields: Field[];
  formData: Record<string, any>;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

export interface Step {
  id: string;
  label: string;
  value: number;
}

export interface StepModalProps {
  steps: Step[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export interface SectionHeaderProps {
  title: string;
  onAddClick: () => void;
}

export interface ItemListProps<T extends { id: string }> {
  items: T[];
  selected: string;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  renderItem: (item: T) => React.ReactNode;
}