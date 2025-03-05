// src/pages/stepsPlugins/textInput/TextInputViewer.tsx
import React, { useState, useEffect } from 'react';
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
  
  // Initialize from existing result if available
  useEffect(() => {
    if (step.result?.value) {
      setValue(step.result.value);
    }
  }, [step.result]);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value);
    setError(null);
  };
  
  // Handle submission
  const handleSubmit = () => {
    // Basic validation
    if (required && !value.trim()) {
      setError('To pole jest wymagane');
      return;
    }
    
    if (minLength > 0 && value.length < minLength) {
      setError(`Tekst musi mieć co najmniej ${minLength} znaków`);
      return;
    }
    
    if (maxLength > 0 && value.length > maxLength) {
      setError(`Tekst nie może przekraczać ${maxLength} znaków`);
      return;
    }
    
    // Show loading state
    setLoading(true);
    
    // Create conversation data
    const conversationData: ConversationItem[] = [
      { role: "user", content: value },
      { role: "assistant", content: "Otrzymano tekst wejściowy" }
    ];
    
    // Complete after short delay to show loading state
    setTimeout(() => {
      onComplete({
        value,
        timestamp: new Date().toISOString()
      }, conversationData);
      
      setLoading(false);
    }, 300);
  };
  
  // Rejestracja handlera dla systemu handlerów
  useEffect(() => {
    // Funkcja do wywołania przez przycisk "Next", która wykona walidację
    const validationHandler = () => {
      // Sprawdź czy dane są poprawne przed wywołaniem handleComplete
      if (required && !value.trim()) {
        setError('To pole jest wymagane');
        return;
      }
      
      if (minLength > 0 && value.length < minLength) {
        setError(`Tekst musi mieć co najmniej ${minLength} znaków`);
        return;
      }
      
      if (maxLength > 0 && value.length > maxLength) {
        setError(`Tekst nie może przekraczać ${maxLength} znaków`);
        return;
      }
      
      // Jeśli walidacja OK, wykonaj normalny handler
      handleSubmit();
    };
    
    registerPluginHandler(step.id, validationHandler);
    
    // Usunięcie handlera przy odmontowaniu komponentu
    return () => {
      unregisterPluginHandler(step.id);
    };
  }, [step.id, value, required, minLength, maxLength]);
  
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