// src/plugins/textInput/TextInputValidation.ts
import { StepConfig, TaskContext } from '../../modules/pluginSystem/types';

export function TextInputValidation(
  step: StepConfig, 
  _context: TaskContext
): { valid: boolean; error?: string } {
  const { data = {}, result } = step;
  
  // Jeśli krok nie jest ukończony, tylko sprawdź podstawową konfigurację
  if (step.status !== 'completed') {
    if (!step.title) {
      return { valid: false, error: 'Tytuł kroku jest wymagany' };
    }
    return { valid: true };
  }
  
  // Sprawdź wymagane pole dla ukończonych kroków
  const required = data.required !== false;
  if (required && (!result || !result.value || !result.value.trim())) {
    return {
      valid: false,
      error: "Pole wymagane nie może być puste"
    };
  }
  
  // Sprawdź minimalną długość
  const minLength = data.minLength || 0;
  if (minLength > 0 && result && result.value && result.value.length < minLength) {
    return {
      valid: false,
      error: `Tekst musi mieć co najmniej ${minLength} znaków`
    };
  }
  
  // Sprawdź maksymalną długość
  const maxLength = data.maxLength || 0;
  if (maxLength > 0 && result && result.value && result.value.length > maxLength) {
    return {
      valid: false,
      error: `Tekst nie może przekraczać ${maxLength} znaków`
    };
  }
  
  return { valid: true };
}