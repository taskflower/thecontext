// src/plugins/static-response/index.tsx
import React from 'react';
import { Plugin, UserInputProcessorContext } from '../../modules/plugin/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Definicja opcji pluginu
const options = [
  {
    id: 'staticResponse',
    label: 'Predefiniowana odpowiedź',
    type: 'text' as const,
    default: 'Akceptuję warunki scenariusza.'
  },
  {
    id: 'buttonText',
    label: 'Tekst przycisku',
    type: 'text' as const,
    default: 'Użyj szybkiej odpowiedzi'
  },
  {
    id: 'showPreview',
    label: 'Pokaż podgląd odpowiedzi',
    type: 'boolean' as const,
    default: true
  }
];

// Komponent renderujący niestandardowy interfejs
const StaticResponseUI: React.FC<{
  response: string;
  buttonText: string;
  showPreview: boolean;
  onClick: () => void;
}> = ({ response, buttonText, showPreview, onClick }) => {
  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Szybka odpowiedź</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showPreview && (
          <div className="text-sm bg-background p-3 rounded-md border">
            <p>{response}</p>
          </div>
        )}
        <Button onClick={onClick} className="w-full">
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

// Definicja pluginu
const StaticResponsePlugin: Plugin = {
  id: 'static-response',
  name: 'Szybka Odpowiedź',
  description: 'Zastępuje pole tekstowe predefiniowaną odpowiedzią.',
  version: '1.0.0',
  options: options,
  
  // Główna funkcja przetwarzania wiadomości asystenta
  process: async (text: string) => {
    // W tym przypadku nic nie modyfikujemy w wiadomości asystenta
    return text;
  },
  
  // Funkcja do obsługi wejścia użytkownika
  processUserInput: async (context: UserInputProcessorContext) => {
    const { options, onChange, provideCustomRenderer } = context;
    
    // Pobierz wartości opcji
    const staticResponse = options.staticResponse || 'Akceptuję warunki scenariusza.';
    const buttonText = options.buttonText || 'Użyj szybkiej odpowiedzi';
    const showPreview = options.showPreview !== false;
    
    // Dostarcz niestandardowy renderer
    provideCustomRenderer(
      <StaticResponseUI
        response={staticResponse}
        buttonText={buttonText}
        showPreview={showPreview}
        onClick={() => {
          // Po kliknięciu przycisku, ustaw predefiniowaną odpowiedź
          onChange(staticResponse);
        }}
      />
    );
    
    // Zwróć bieżącą wartość (nie jest konieczne)
    return context.currentValue;
  }
};

export default StaticResponsePlugin;