// AppDataCollector.tsx - Handles data collection phase
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { getAllPlugins } from '../../registry';


interface AppDataCollectorProps {
  title: string;
  onGenerateApp: (description: string, plugins: string[]) => void;
  loading: boolean;
}

export function AppDataCollector({ title, onGenerateApp, loading }: AppDataCollectorProps) {
  const [appDescription, setAppDescription] = useState('');
  const [availablePlugins, setAvailablePlugins] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Load available plugins on mount
  useEffect(() => {
    try {
      const plugins = getAllPlugins();
      const pluginTypes = plugins.map(plugin => plugin.type);
      setAvailablePlugins(pluginTypes);
    } catch (err) {
      console.error("Error loading plugins:", err);
      setError("Failed to load available plugins.");
    }
  }, []);
  
  const handleSubmit = () => {
    if (!appDescription.trim()) {
      setError("Please provide an application description.");
      return;
    }
    
    setError(null);
    onGenerateApp(appDescription, availablePlugins);
  };
  
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{title || 'Create Application'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">Describe the application you want to create. For example: "Marketing campaign application for product launch" or "Website analysis and SEO improvement application".</p>
          </div>
          
          <Textarea
            value={appDescription}
            onChange={(e) => setAppDescription(e.target.value)}
            placeholder="Describe what kind of application you need..."
            className="min-h-32"
            disabled={loading}
          />
          
          {error && (
            <div className="p-3 border border-destructive/50 bg-destructive/10 rounded-md flex items-start gap-2">
              <AlertCircle size={16} className="text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={loading || !appDescription.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {loading ? 'Generating...' : 'Generate Application'}
        </Button>
      </CardFooter>
    </Card>
  );
}