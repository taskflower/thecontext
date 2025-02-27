// src/components/tasks/steps/FormStepRenderer.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useTaskStore } from '@/store/taskStore';
import { ITaskStep } from '@/types/taskTypes';

interface FormStepRendererProps {
  step: ITaskStep;
  taskId: string;
  onComplete: (data: any) => void;
}

export const FormStepRenderer: React.FC<FormStepRendererProps> = ({ 
  step, 
  taskId, 
  onComplete 
}) => {
  // Inicjalizacja danymi wejściowymi lub wartościami domyślnymi
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { updateStep } = useTaskStore();
  
  useEffect(() => {
    // Wypełnij formularz danymi wejściowymi lub wartościami domyślnymi
    if (!step.formConfig) return;
    
    const initialData: Record<string, any> = {};
    
    // Jeśli mamy dane wejściowe, użyj ich
    if (step.input) {
      try {
        Object.assign(initialData, JSON.parse(step.input));
      } catch (e) {
        console.error('Błąd parsowania danych wejściowych:', e);
      }
    }
    
    // Uzupełnij brakujące pola wartościami domyślnymi
    step.formConfig.fields.forEach(field => {
      if (!(field.id in initialData) && field.defaultValue !== undefined) {
        initialData[field.id] = field.defaultValue;
      }
    });
    
    setFormData(initialData);
  }, [step]);
  
  if (!step.formConfig) {
    return <div>Brak konfiguracji formularza</div>;
  }
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    step.formConfig.fields.forEach(field => {
      // Sprawdź czy pole jest wymagane
      if (field.required && 
          (formData[field.id] === undefined || 
           formData[field.id] === '' || 
           formData[field.id] === null)) {
        newErrors[field.id] = 'To pole jest wymagane';
        isValid = false;
      }
      
      // Dodatkowe walidacje
      if (field.validationRules && formData[field.id] !== undefined) {
        // Sprawdź minimalną długość
        if (field.validationRules.minLength && 
            typeof formData[field.id] === 'string' && 
            formData[field.id].length < field.validationRules.minLength) {
          newErrors[field.id] = `Minimum ${field.validationRules.minLength} znaków`;
          isValid = false;
        }
        
        // Sprawdź maksymalną długość
        if (field.validationRules.maxLength && 
            typeof formData[field.id] === 'string' && 
            formData[field.id].length > field.validationRules.maxLength) {
          newErrors[field.id] = `Maksimum ${field.validationRules.maxLength} znaków`;
          isValid = false;
        }
        
        // Sprawdź zakres liczbowy
        if (field.type === 'number') {
          const value = Number(formData[field.id]);
          if (field.validationRules.min !== undefined && value < field.validationRules.min) {
            newErrors[field.id] = `Minimalna wartość to ${field.validationRules.min}`;
            isValid = false;
          }
          if (field.validationRules.max !== undefined && value > field.validationRules.max) {
            newErrors[field.id] = `Maksymalna wartość to ${field.validationRules.max}`;
            isValid = false;
          }
        }
        
        // Sprawdź format daty
        if (field.type === 'date' && field.validationRules.minDate) {
          const minDate = new Date(field.validationRules.minDate);
          const value = new Date(formData[field.id]);
          if (value < minDate) {
            newErrors[field.id] = `Minimalna data to ${minDate.toLocaleDateString()}`;
            isValid = false;
          }
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    updateStep(taskId, step.id, { 
      output: JSON.stringify(formData),
      status: 'completed'
    });
    
    onComplete(formData);
  };
  
  const renderField = (field: any) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            value={formData[field.id] || ''}
            onChange={e => setFormData({...formData, [field.id]: e.target.value})}
            required={field.required}
            className={errors[field.id] ? 'border-red-500' : ''}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={formData[field.id] || ''}
            onChange={e => setFormData({...formData, [field.id]: e.target.value})}
            required={field.required}
            rows={5}
            className={errors[field.id] ? 'border-red-500' : ''}
          />
        );
        
      case 'select':
        return (
          <Select
            value={formData[field.id] || ''}
            onValueChange={value => setFormData({...formData, [field.id]: value})}
          >
            <SelectTrigger className={errors[field.id] ? 'border-red-500' : ''}>
              <SelectValue placeholder="Wybierz..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'radio':
        return (
          <RadioGroup
            value={formData[field.id] || ''}
            onValueChange={value => setFormData({...formData, [field.id]: value})}
            className="space-y-2"
          >
            {field.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={!!formData[field.id]}
              onCheckedChange={checked => setFormData({...formData, [field.id]: !!checked})}
            />
            <Label htmlFor={field.id}>{field.label}</Label>
          </div>
        );
        
      case 'number':
        return (
          <Input
            id={field.id}
            type="number"
            value={formData[field.id] || ''}
            onChange={e => setFormData({...formData, [field.id]: Number(e.target.value)})}
            required={field.required}
            min={field.validationRules?.min}
            max={field.validationRules?.max}
            className={errors[field.id] ? 'border-red-500' : ''}
          />
        );
        
      case 'date':
        return (
          <Input
            id={field.id}
            type="date"
            value={formData[field.id] || ''}
            onChange={e => setFormData({...formData, [field.id]: e.target.value})}
            required={field.required}
            min={field.validationRules?.minDate}
            max={field.validationRules?.maxDate}
            className={errors[field.id] ? 'border-red-500' : ''}
          />
        );
        
      default:
        return <div>Nieobsługiwany typ pola: {field.type}</div>;
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {step.formConfig.fields.map(field => (
        <div key={field.id} className="space-y-2">
          {field.type !== 'checkbox' && (
            <Label htmlFor={field.id} className="block text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
          )}
          
          {renderField(field)}
          
          {errors[field.id] && (
            <p className="text-sm text-red-500">{errors[field.id]}</p>
          )}
        </div>
      ))}
      
      <Button type="submit">
        {step.formConfig.submitLabel || 'Zapisz'}
      </Button>
    </form>
  );
};