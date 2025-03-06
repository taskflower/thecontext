// src/pages/stepsPlugins/boilerplate_action/SimplePluginViewer.tsx
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ViewerProps } from '../types';
import { ConversationItem } from '@/types';
import { registerPluginHandler, unregisterPluginHandler } from '../pluginHandlers';

export function SimplePluginViewer({ step, onComplete }: ViewerProps) {
  // Używamy useRef do śledzenia montowania/odmontowywania komponentu
  const isMounted = useRef(true);
  
  // Stan komponentu
  const [loading, setLoading] = useState(false);
  
  // Efekt dla resetowania stanu przy montowaniu/odmontowywaniu
  useEffect(() => {
    // Oznaczamy komponent jako zamontowany
    isMounted.current = true;
    
    // Resetujemy stan ładowania
    setLoading(false);
    
    // Funkcja czyszcząca
    return () => {
      // Oznaczamy komponent jako odmontowany
      isMounted.current = false;
    };
  }, [step.id]);
  
  // Funkcja obsługująca zakończenie kroku
  const handleComplete = () => {
    // Tylko jeśli komponent jest zamontowany
    if (!isMounted.current) return;
    
    setLoading(true);
    
    // Create conversation data
    const conversationData: ConversationItem[] = [
      {
        role: "user", 
        content: `plugin ${step.title} complete`
      }
    ];
    
    // Symulacja przetwarzania dla lepszego doświadczenia UX
    setTimeout(() => {
      // Sprawdzamy ponownie czy komponent jest nadal zamontowany
      if (isMounted.current) {
        // Wywołanie onComplete z rezultatem
        onComplete({
          title: step.title,
          timestamp: new Date().toISOString(),
          completed: true
        }, conversationData);
      }
    }, 750); // 1 sekunda opóźnienia dla symulacji przetwarzania
  };
  
  // Rejestracja handlera dla systemu handlerów
  useEffect(() => {
    // Rejestrujemy handler
    registerPluginHandler(step.id, handleComplete);
    
    // Usunięcie handlera przy odmontowaniu komponentu
    return () => {
      unregisterPluginHandler(step.id);
    };
  }, [step.id, onComplete]);
  
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{step.title || 'Simple Plugin'}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{step.description || 'This is a simple plugin step.'}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleComplete} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {loading ? 'Przetwarzanie...' : 'Zakończ krok'}
        </Button>
      </CardFooter>
    </Card>
  );
}