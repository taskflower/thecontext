// SimplePluginViewer.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ViewerProps } from '../types';
import { ConversationItem } from '@/types';

export function SimplePluginViewer({ step, onComplete }: ViewerProps) {
  const [loading, setLoading] = useState(false);
  
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
          {loading ? 'Processing...' : 'Complete Step'}
        </Button>
      </CardFooter>
    </Card>
  );
}