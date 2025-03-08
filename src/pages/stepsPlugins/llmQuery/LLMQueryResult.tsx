// src/pages/stepsPlugins/llmQuery/LLMQueryResult.tsx
import { Card, CardContent } from '@/components/ui/card';
import { ResultRendererProps } from '../types';
import { ConversationItem } from '@/types';

export function LLMQueryResult({ step }: ResultRendererProps) {
  const result = step.result;
  
  if (!result) {
    return <div>Brak wyniku zapytania</div>;
  }
  
  // Pobierz dane konwersacji jeśli istnieją
  const conversationData = result.conversationData || result.messages;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
         
          {conversationData && conversationData.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Historia konwersacji</h3>
              <div className="border rounded divide-y">
                {conversationData.map((msg: ConversationItem, idx: number) => (
                  <div key={idx} className={`p-3 ${msg.role === 'assistant' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    <div className="text-xs font-semibold mb-1">
                      {msg.role === 'assistant' ? 'Asystent' : 'Użytkownik'}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}