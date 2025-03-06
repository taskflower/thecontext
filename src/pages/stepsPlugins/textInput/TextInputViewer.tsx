// src/pages/stepsPlugins/textInput/TextInputViewer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { ViewerProps } from '../types';
import { ConversationItem } from '@/types';
import { registerPluginHandler, unregisterPluginHandler } from '../pluginHandlers';

export function TextInputViewer({ step, onComplete }: ViewerProps) {
  // Używamy useRef do śledzenia montowania/odmontowywania komponentu
  const isMounted = useRef(true);
  
  // Stany komponentu
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Config with defaults
  const {
    placeholder = 'Enter your text here...',
    minLength = 0,
    maxLength = 1000,
    required = true,
    multiline = true,
    rows = 6
  } = step.config || {};
  
  // Resetowanie stanu przy każdym remount komponentu
  useEffect(() => {
    // Oznaczamy komponent jako zamontowany
    isMounted.current = true;
    
    // Inicjalizacja z istniejącym wynikiem jeśli dostępny
    if (step.result?.value) {
      setValue(step.result.value);
    } else {
      setValue('');
    }
    
    // Resetujemy błąd przy każdym montowaniu komponentu
    setError(null);
    setLoading(false);
    
    // Cleanup funkcja
    return () => {
      // Oznaczamy komponent jako odmontowany
      isMounted.current = false;
    };
  }, [step.id, step.result?.value]);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Czyścimy błąd przy każdej zmianie wartości pola
    setError(null);
  };
  
  // Funkcja walidacji wejścia
  const validateInput = (): boolean => {
    // Basic validation
    if (required && !value.trim()) {
      setError('To pole jest wymagane');
      return false;
    }
    
    if (minLength > 0 && value.length < minLength) {
      setError(`Tekst musi mieć co najmniej ${minLength} znaków`);
      return false;
    }
    
    if (maxLength > 0 && value.length > maxLength) {
      setError(`Tekst nie może przekraczać ${maxLength} znaków`);
      return false;
    }
    
    // Wyczyść błąd jeśli wszystko jest poprawne
    setError(null);
    return true;
  };
  
  // Handle submission - całkowicie przebudowany
  const handleSubmit = () => {
    // Najpierw czyścimy poprzednie błędy
    setError(null);
    
    // Validate input first
    if (!validateInput()) {
      return;
    }
    
    // Show loading state
    setLoading(true);
    
    // Create conversation data
    const conversationData: ConversationItem[] = [
      { role: "user", content: value },
      { role: "assistant", content: "Otrzymano tekst wejściowy" }
    ];
    
    // Wywołanie onComplete bez opóźnień
    onComplete({
      value,
      timestamp: new Date().toISOString()
    }, conversationData);
  };
  
  // Rejestracja handlera dla systemu handlerów
  useEffect(() => {
    // Tworzymy funkcję, która będzie się odnosić do bieżącego stanu wartości
    const validationHandler = () => {
      // Tylko jeśli komponent jest nadal zamontowany
      if (isMounted.current) {
        // Wyczyść błąd przed próbą walidacji
        setError(null);
        
        // Wywołaj walidację i jeśli OK - wykonaj submit
        if (validateInput()) {
          // Pokaż stan ładowania
          setLoading(true);
          
          // Create conversation data
          const conversationData: ConversationItem[] = [
            { role: "user", content: value },
            { role: "assistant", content: "Otrzymano tekst wejściowy" }
          ];
          
          // Wywołaj onComplete bezpośrednio
          onComplete({
            value,
            timestamp: new Date().toISOString()
          }, conversationData);
        }
      }
    };
    
    // Rejestruj handler
    registerPluginHandler(step.id, validationHandler);
    
    // Usunięcie handlera przy odmontowaniu komponentu
    return () => {
      unregisterPluginHandler(step.id);
    };
  }, [step.id, value, required, minLength, maxLength, onComplete]);
  
  // Character count indicator
  const renderCharCount = () => {
    if (minLength <= 0 && maxLength <= 0) return null;
    
    return (
      <div className="text-xs text-muted-foreground mt-2 flex justify-between">
        {minLength > 0 && <div>{value.length} / {minLength} min znaków</div>}
        {maxLength > 0 && <div>{value.length} / {maxLength} max znaków</div>}
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{step.title || 'Text Input'}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {step.description || 'Wprowadź tekst poniżej'}
        </p>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {multiline ? (
          <Textarea
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            className="min-h-[100px]"
            rows={rows}
          />
        ) : (
          <Input
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
          />
        )}
        
        {renderCharCount()}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={loading || (required && !value.trim())}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Przetwarzanie...
            </>
          ) : (
            "Zatwierdź"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}