/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/text-analyzer/index.tsx
// Przykładowy prosty plugin analizatora tekstu

import React, { useState, useEffect } from 'react';
import { PluginBase, PluginProps } from '../../modules/plugins_system/PluginInterface';
import { Node } from '../../modules/scenarios_module/types';
import { useScenarioStore } from '../../modules/scenarios_module/scenarioStore';

// Interfejs konfiguracji pluginu
interface TextAnalyzerConfig {
  includeWordCount: boolean;
  includeSentenceCount: boolean;
  includeReadingTime: boolean;
}

// Implementacja pluginu analizatora tekstu
class TextAnalyzerPlugin extends PluginBase {
  constructor() {
    super(
      'text-analyzer',
      'Text Analyzer',
      'Analizuje tekst pod kątem liczby słów, zdań i czasu czytania'
    );
    
    // Domyślna konfiguracja
    this.defaultConfig = {
      includeWordCount: true,
      includeSentenceCount: true,
      includeReadingTime: true
    };
  }
  
  // Komponent widoku
  ViewComponent: React.FC<PluginProps> = ({ config, onResponseChange }) => {
    const [text, setText] = useState('');
    const [analysis, setAnalysis] = useState<Record<string, any>>({});
    
    const analyzeText = () => {
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      const readingTimeMinutes = Math.ceil(wordCount / 200); // Średnio 200 słów na minutę
      
      const results: Record<string, any> = {};
      
      if (config?.includeWordCount) {
        results.wordCount = wordCount;
      }
      
      if (config?.includeSentenceCount) {
        results.sentenceCount = sentenceCount;
      }
      
      if (config?.includeReadingTime) {
        results.readingTimeMinutes = readingTimeMinutes;
      }
      
      setAnalysis(results);
      
      // Przekształć wyniki w odpowiedź tekstową
      const responseText = Object.entries(results)
        .map(([key, value]) => {
          switch(key) {
            case 'wordCount': return `Liczba słów: ${value}`;
            case 'sentenceCount': return `Liczba zdań: ${value}`;
            case 'readingTimeMinutes': return `Szacowany czas czytania: ${value} min`;
            default: return `${key}: ${value}`;
          }
        })
        .join('\n');
      
      if (onResponseChange) {
        onResponseChange(responseText);
      }
    };
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tekst do analizy</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Wprowadź tekst do analizy..."
            className="w-full p-2 border rounded-md min-h-32"
          />
        </div>
        
        <button
          onClick={analyzeText}
          disabled={!text.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
        >
          Analizuj
        </button>
        
        {Object.keys(analysis).length > 0 && (
          <div className="p-4 border rounded-md bg-gray-50">
            <h3 className="font-medium mb-2">Wyniki analizy:</h3>
            <ul className="space-y-1">
              {Object.entries(analysis).map(([key, value]) => (
                <li key={key}>
                  {key === 'wordCount' && <span>Liczba słów: {value}</span>}
                  {key === 'sentenceCount' && <span>Liczba zdań: {value}</span>}
                  {key === 'readingTimeMinutes' && <span>Szacowany czas czytania: {value} min</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  // Komponent konfiguracji
  ConfigComponent: React.FC<PluginProps> = ({ config, onConfigChange }) => {
    const handleCheckboxChange = (key: keyof TextAnalyzerConfig) => {
      if (onConfigChange) {
        onConfigChange({ [key]: !(config as TextAnalyzerConfig)?.[key] });
      }
    };
    
    return (
      <div className="space-y-3">
        <h3 className="font-medium">Konfiguracja analizatora tekstu</h3>
        
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config?.includeWordCount || false}
              onChange={() => handleCheckboxChange('includeWordCount')}
              className="rounded"
            />
            <span>Liczba słów</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config?.includeSentenceCount || false}
              onChange={() => handleCheckboxChange('includeSentenceCount')}
              className="rounded"
            />
            <span>Liczba zdań</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config?.includeReadingTime || false}
              onChange={() => handleCheckboxChange('includeReadingTime')}
              className="rounded"
            />
            <span>Szacowany czas czytania</span>
          </label>
        </div>
      </div>
    );
  };
  
  // Komponent wyników
  ResultComponent: React.FC<PluginProps> = ({ nodeId, config }) => {
    const [result, setResult] = useState<string | null>(null);
    
    // Pobierz zapisany wynik dla węzła (jeśli istnieje)
    useEffect(() => {
      if (nodeId) {
        const nodeResponse = useScenarioStore.getState().nodeResponses[nodeId];
        if (nodeResponse) {
          setResult(nodeResponse);
        }
      }
    }, [nodeId]);
    
    if (!result) {
      return (
        <div className="p-4 text-center text-gray-500">
          Brak wyników analizy. Użyj zakładki "View" aby przeanalizować tekst.
        </div>
      );
    }
    
    return (
      <div className="p-4 border rounded-md bg-gray-50">
        <h3 className="font-medium mb-2">Wyniki analizy:</h3>
        <pre className="whitespace-pre-wrap">{result}</pre>
      </div>
    );
  };
  
  // Przetwarzanie węzła
  processNode(node: Node, response?: string): { node: Node, result: any } {
    // W tym przypadku po prostu przekazujemy odpowiedź jako wynik
    return { 
      node,
      result: response
    };
  }
}

export default new TextAnalyzerPlugin();