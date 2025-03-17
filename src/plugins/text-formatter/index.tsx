// src/plugins/text-formatter/index.tsx
import { Plugin, PluginOptions } from '../../modules/plugin/types';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Dostępne operacje formatowania jako string (zgodny z indeksem PluginOptions)
type FormatOperation = 'uppercase' | 'lowercase' | 'capitalize' | 'trim' | 'count';

// Najprostsze i najelegantsze rozwiązanie - nie tworzymy własnego interfejsu,
// używamy PluginOptions bezpośrednio
const formatterPlugin: Plugin = {
  config: {
    id: 'text-formatter',
    name: 'Formatter Tekstu',
    description: 'Plugin do formatowania tekstu na różne sposoby',
    version: '1.0.0',
    optionsSchema: [
      {
        id: 'operation',
        label: 'Operacja formatowania',
        type: 'select',
        default: 'capitalize',
        options: [
          { value: 'uppercase', label: 'Wielkie litery' },
          { value: 'lowercase', label: 'Małe litery' },
          { value: 'capitalize', label: 'Każde Słowo Z Wielkiej Litery' },
          { value: 'trim', label: 'Usuń białe znaki' },
          { value: 'count', label: 'Dodaj liczbę znaków/słów' }
        ]
      }
    ]
  },

  // Funkcja przetwarzająca wiadomość
  async process(message: string, options?: PluginOptions): Promise<string> {
    console.log('Formatter procesuje wiadomość');
    
    // Domyślna operacja
    const operation = options?.operation as FormatOperation || 'capitalize';
    
    let result = message;
    
    switch (operation) {
      case 'uppercase':
        result = message.toUpperCase();
        break;
        
      case 'lowercase':
        result = message.toLowerCase();
        break;
        
      case 'capitalize':
        result = message.replace(/\b\w/g, char => char.toUpperCase());
        break;
        
      case 'trim':
        result = message.trim().replace(/\s+/g, ' ');
        break;
        
      case 'count':
        { const charCount = message.length;
        const wordCount = message.trim().split(/\s+/).length;
        result = `${message}\n\n---\nStatystyki: ${charCount} znaków, ${wordCount} słów`;
        break; }
    }
    
    return result;
  },
  
  // Niestandardowy UI dla opcji
  renderOptionsUI(options: PluginOptions, onChange: (newOptions: PluginOptions) => void) {
    const operation = options.operation as FormatOperation || 'capitalize';
    
    return (
      <Card className="p-4">
        <Label className="text-sm font-medium mb-2 block">Wybierz operację formatowania:</Label>
        <RadioGroup
          value={operation}
          onValueChange={(value) => onChange({ 
            ...options, 
            operation: value
          })}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="uppercase" id="uppercase" />
            <Label htmlFor="uppercase">Wielkie litery</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="lowercase" id="lowercase" />
            <Label htmlFor="lowercase">Małe litery</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="capitalize" id="capitalize" />
            <Label htmlFor="capitalize">Każde Słowo Z Wielkiej Litery</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="trim" id="trim" />
            <Label htmlFor="trim">Usuń białe znaki</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="count" id="count" />
            <Label htmlFor="count">Dodaj liczbę znaków/słów</Label>
          </div>
        </RadioGroup>
      </Card>
    );
  }
};

export default formatterPlugin;