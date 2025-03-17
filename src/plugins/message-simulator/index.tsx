// src/plugins/message-simulator/index.tsx
import { Plugin, PluginOptions } from '../../modules/plugin/types';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MinusIcon, PlusIcon } from 'lucide-react';

interface SimulatorOptions extends PluginOptions {
  delay: number;     // Opóźnienie w milisekundach
  typingEffect: boolean;  // Symulacja pisania
  typingSpeed: number;    // Szybkość pisania (ms na znak)
}

// Domyślne opcje
const defaultOptions: SimulatorOptions = {
  delay: 1000,
  typingEffect: false,
  typingSpeed: 30
};

const messageSimulatorPlugin: Plugin = {
  config: {
    id: 'message-simulator',
    name: 'Symulator Wiadomości',
    description: 'Symuluje opóźnienia w wysyłaniu wiadomości i efekt pisania',
    version: '1.0.0',
    optionsSchema: [
      {
        id: 'delay',
        label: 'Opóźnienie (ms)',
        type: 'number',
        default: 1000
      },
      {
        id: 'typingEffect',
        label: 'Efekt pisania',
        type: 'boolean',
        default: false
      },
      {
        id: 'typingSpeed',
        label: 'Szybkość pisania (ms/znak)',
        type: 'number',
        default: 30
      }
    ]
  },

  // Funkcja przetwarzająca wiadomość
  async process(message: string, options?: PluginOptions): Promise<string> {
    console.log('Message Simulator procesuje wiadomość z opcjami:', options);
    
    // Użyj domyślnych opcji, jeśli nie podano innych
    const processOptions = {
      ...defaultOptions,
      ...options
    };
    
    // Jeśli jest uruchomiony w prawdziwym środowisku przeglądarki, symuluj opóźnienie
    if (typeof window !== 'undefined') {
      // Symuluj opóźnienie przed odpowiedzią
      await new Promise(resolve => setTimeout(resolve, processOptions.delay));
      
      // Symulowanie efektu pisania można zaimplementować za pomocą
      // alternatywnej metody, np. aktualizując stan w komponencie React
      // Tutaj zwracamy oryginalną wiadomość, a efekt pisania byłby obsługiwany po stronie UI
    }
    
    return message;
  },
  
  // Niestandardowy UI dla opcji
  renderOptionsUI(options: PluginOptions, onChange: (newOptions: PluginOptions) => void) {
    const mergedOptions = { ...defaultOptions, ...options as SimulatorOptions };
    
    return (
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="delay">Opóźnienie: {mergedOptions.delay}ms</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onChange({ 
                ...mergedOptions, 
                delay: Math.max(0, mergedOptions.delay - 100) 
              } as PluginOptions)}
            >
              <MinusIcon className="h-4 w-4" />
            </Button>
            
            <Input
              id="delay"
              type="number"
              min={0}
              max={5000}
              step={100}
              value={mergedOptions.delay}
              onChange={(e) => onChange({ 
                ...mergedOptions, 
                delay: parseInt(e.target.value) || 0 
              } as PluginOptions)}
              className="w-full"
            />
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onChange({ 
                ...mergedOptions, 
                delay: Math.min(5000, mergedOptions.delay + 100) 
              } as PluginOptions)}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="typingEffect"
            checked={mergedOptions.typingEffect}
            onCheckedChange={(checked) => onChange({ ...mergedOptions, typingEffect: checked } as PluginOptions)}
          />
          <Label htmlFor="typingEffect">Efekt pisania</Label>
        </div>
        
        {mergedOptions.typingEffect && (
          <div className="space-y-2 pl-6">
            <Label htmlFor="typingSpeed">
              Szybkość pisania: {mergedOptions.typingSpeed}ms/znak
            </Label>
            <Input
              id="typingSpeed"
              type="number"
              min={10}
              max={200}
              value={mergedOptions.typingSpeed}
              onChange={(e) =>               onChange({ 
                ...mergedOptions, 
                typingSpeed: parseInt(e.target.value) || defaultOptions.typingSpeed 
              } as PluginOptions)}
              className="w-full"
            />
          </div>
        )}
      </Card>
    );
  }
};

export default messageSimulatorPlugin;