// src/plugins/data-processor/index.tsx
import React from 'react';
import { Plugin, PluginOptions } from '../../modules/plugin/types';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

// Typy operacji
type DataOperation = 'extract-json' | 'extract-table' | 'extract-dates' | 'add-template';

interface DataProcessorOptions extends PluginOptions {
  operation: DataOperation;
  template: string;
  appendResult: boolean;
}

// Domyślne opcje
const defaultOptions: DataProcessorOptions = {
  operation: 'extract-json',
  template: '{ "pole1": "{{dane1}}", "pole2": "{{dane2}}" }',
  appendResult: true
};

// Funkcja do ekstrahowania dat z tekstu
function extractDates(text: string): string[] {
  // Prosty regex do wykrywania dat w formatach DD.MM.YYYY, YYYY-MM-DD, itp.
  const dateRegex = /\b(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}[./-]\d{1,2}[./-]\d{1,2})\b/g;
  const matches = text.match(dateRegex);
  return matches || [];
}

// Funkcja do ekstrahowania tabel z tekstu (prosta implementacja)
function extractTableFromText(text: string): string {
  // Szukamy bloków tekstu, które wyglądają jak tabele
  const lines = text.split('\n');
  const tableLines = [];
  let inTable = false;
  
  for (const line of lines) {
    // Linia z wieloma spacjami lub znakami | sugeruje tabelę
    if (line.includes('|') || (line.trim() && line.includes('  '))) {
      inTable = true;
      tableLines.push(line);
    } else if (inTable && line.trim() === '') {
      // Pusta linia kończy tabelę
      inTable = false;
      tableLines.push(''); // Dodaj pustą linię jako separator
    }
  }
  
  return tableLines.join('\n');
}

// Funkcja do ekstrahowania JSON
function extractJsonFromText(text: string): string {
  // Próbujemy znaleźć bloki, które wyglądają jak JSON
  try {
    const jsonRegex = /{[\s\S]*?}/g;
    const matches = text.match(jsonRegex);
    
    if (matches) {
      // Sprawdź, które z dopasowań są poprawnym JSON
      const validJsons = matches
        .filter(match => {
          try {
            JSON.parse(match);
            return true;
          } catch {
            return false;
          }
        })
        .map(json => {
          // Próbuj sformatować JSON
          try {
            return JSON.stringify(JSON.parse(json), null, 2);
          } catch {
            return json;
          }
        });
        
      if (validJsons.length > 0) {
        return validJsons.join('\n\n');
      }
    }
    
    return "Nie znaleziono poprawnego JSON";
  } catch (error) {
    return "Błąd podczas przetwarzania JSON: " + error;
  }
}

// Funkcja uzupełniająca szablon
function fillTemplate(template: string, text: string): string {
  // Prosta implementacja - próbujemy dopasować tekst do szablonu
  // W rzeczywistości potrzebne byłoby bardziej zaawansowane przetwarzanie
  
  let result = template;
  
  // Szukamy wzorców {{nazwaPola}} w szablonie
  const placeholders = template.match(/{{([^{}]+)}}/g) || [];
  
  // Dla każdego placeholder próbujemy znaleźć wartość
  for (const placeholder of placeholders) {
    const fieldName = placeholder.replace('{{', '').replace('}}', '');
    
    // Prosta heurystyka - szukamy wartości po etykiecie w tekście
    const regex = new RegExp(`${fieldName}[\\s:]*([^\\n,;]+)`, 'i');
    const match = text.match(regex);
    
    if (match && match[1]) {
      result = result.replace(placeholder, match[1].trim());
    }
  }
  
  return result;
}

const dataProcessorPlugin: Plugin = {
  config: {
    id: 'data-processor',
    name: 'Procesor Danych',
    description: 'Wyciąga struktury danych (JSON, tabele, daty) z tekstu lub uzupełnia szablony',
    version: '1.0.0',
    optionsSchema: [
      {
        id: 'operation',
        label: 'Operacja',
        type: 'select',
        default: 'extract-json',
        options: [
          { value: 'extract-json', label: 'Wyciągnij JSON' },
          { value: 'extract-table', label: 'Wyciągnij tabele' },
          { value: 'extract-dates', label: 'Wyciągnij daty' },
          { value: 'add-template', label: 'Uzupełnij szablon' }
        ]
      },
      {
        id: 'template',
        label: 'Szablon',
        type: 'text',
        default: '{ "pole1": "{{dane1}}", "pole2": "{{dane2}}" }'
      },
      {
        id: 'appendResult',
        label: 'Dołącz wynik',
        type: 'boolean',
        default: true
      }
    ]
  },

  // Funkcja przetwarzająca wiadomość
  async process(message: string, options?: PluginOptions): Promise<string> {
    console.log('Data Processor procesuje wiadomość:', options);
    
    // Użyj domyślnych opcji, jeśli nie podano innych
    const processOptions = {
      ...defaultOptions,
      ...options
    };
    
    let result = '';
    
    switch (processOptions.operation) {
      case 'extract-json':
        result = extractJsonFromText(message);
        break;
        
      case 'extract-table':
        result = extractTableFromText(message);
        break;
        
      case 'extract-dates':
        { const dates = extractDates(message);
        result = dates.length > 0 ? dates.join('\n') : "Nie znaleziono dat";
        break; }
        
      case 'add-template':
        if (processOptions.template) {
          result = fillTemplate(processOptions.template, message);
        } else {
          result = "Nie podano szablonu";
        }
        break;
    }
    
    // Zwróć wynik
    if (processOptions.appendResult && result) {
      return `${message}\n\n--- Wynik przetwarzania ---\n${result}`;
    } else {
      return result || message;
    }
  },
  
  // Niestandardowy UI dla opcji
  renderOptionsUI(options: PluginOptions, onChange: (newOptions: PluginOptions) => void) {
    const mergedOptions = { ...defaultOptions, ...options as DataProcessorOptions };
    // Use a ref instead of state to avoid React Hook rule violations
    const tabValue = React.useRef<string>(mergedOptions.operation);
    
    return (
      <Card className="p-4 space-y-4">
        <div>
          <Label htmlFor="operation">Operacja:</Label>
          <Select
            value={mergedOptions.operation}
            onValueChange={(value) => {
              tabValue.current = value;
              onChange({ ...mergedOptions, operation: value as DataOperation } as PluginOptions);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz operację" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="extract-json">Wyciągnij JSON</SelectItem>
              <SelectItem value="extract-table">Wyciągnij tabele</SelectItem>
              <SelectItem value="extract-dates">Wyciągnij daty</SelectItem>
              <SelectItem value="add-template">Uzupełnij szablon</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Tabs value={mergedOptions.operation} onValueChange={(value) => {
          tabValue.current = value;
          onChange({ ...mergedOptions, operation: value as DataOperation } as PluginOptions);
        }}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="extract-json">JSON</TabsTrigger>
            <TabsTrigger value="extract-table">Tabele</TabsTrigger>
            <TabsTrigger value="extract-dates">Daty</TabsTrigger>
            <TabsTrigger value="add-template">Szablon</TabsTrigger>
          </TabsList>
          
          <TabsContent value="extract-json">
            <p className="text-sm text-muted-foreground">
              Wyciąga obiekty JSON z tekstu i formatuje je.
            </p>
          </TabsContent>
          
          <TabsContent value="extract-table">
            <p className="text-sm text-muted-foreground">
              Identyfikuje i wyciąga struktury tabelaryczne z tekstu.
            </p>
          </TabsContent>
          
          <TabsContent value="extract-dates">
            <p className="text-sm text-muted-foreground">
              Znajduje wszystkie daty w tekście w różnych formatach.
            </p>
          </TabsContent>
          
          <TabsContent value="add-template" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Uzupełnia szablon danymi z tekstu. Użyj {`{{nazwaPola}}`} jako placeholderów.
            </p>
            <Textarea
              value={mergedOptions.template || defaultOptions.template}
              onChange={(e) =>               onChange({ ...mergedOptions, template: e.target.value } as PluginOptions)}
              placeholder="Szablon z placeholderami {{pole}}"
              rows={5}
            />
          </TabsContent>
        </Tabs>
        
        <div className="flex items-center space-x-2 pt-2">
          <Switch
            id="appendResult"
            checked={mergedOptions.appendResult}
            onCheckedChange={(checked) => onChange({ ...mergedOptions, appendResult: checked } as PluginOptions)}
          />
          <Label htmlFor="appendResult">Dołącz wynik do oryginalnego tekstu</Label>
        </div>
      </Card>
    );
  }
};

export default dataProcessorPlugin;