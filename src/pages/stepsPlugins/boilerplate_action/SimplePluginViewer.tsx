// src/pages/stepsPlugins/boilerplate_action/SimplePluginViewer.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ViewerProps } from '../types';
import { ConversationItem } from '@/types';
import { registerPluginHandler, unregisterPluginHandler } from '../pluginHandlers';

export function SimplePluginViewer({ step, onComplete }: ViewerProps) {
  const [loading, setLoading] = useState(false);
  
  // Funkcja obsługująca zakończenie kroku
  const handleComplete = () => {
    setLoading(true);
    
    // Create conversation data
    const conversationData: ConversationItem[] = [
      {
        role: "user", 
        content: `plugin ${step.title} complete`
      }
    ];
    
    // Simulate some processing time
    setTimeout(() => {
      onComplete({
        title: step.title,
        timestamp: new Date().toISOString(),
        completed: true
      }, conversationData);
      setLoading(false);
    }, 1000);
  };
  
  // Rejestracja handlera dla systemu handlerów
  useEffect(() => {
    registerPluginHandler(step.id, handleComplete);
    
    // Usunięcie handlera przy odmontowaniu komponentu
    return () => {
      unregisterPluginHandler(step.id);
    };
  }, [step.id]);
  
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