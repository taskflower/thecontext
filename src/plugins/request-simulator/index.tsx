/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/request-simulator/index.tsx
// Plugin do symulacji zapytania na serwer

import React, { useState } from 'react';
import { PluginBase, PluginProps } from '../../modules/plugins_system/PluginInterface';
import { Node } from '../../modules/scenarios_module/types';
import { useScenarioStore } from '../../modules/scenarios_module/scenarioStore';


class RequestSimulatorPlugin extends PluginBase {
  constructor() {
    super(
      'request-simulator',
      'Request Simulator',
      'Symuluje zapytanie na serwer'
    );

    // Domyślna konfiguracja
    this.defaultConfig = {
      duration: 1000
    };
  }

  // Komponent widoku
  ViewComponent: React.FC<PluginProps> = ({ config, onResponseChange }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string>('');

    const simulateRequest = () => {
      setLoading(true);
      setResult('');
      const duration = config?.duration || 1000;

      setTimeout(() => {
        setLoading(false);
        setResult('Zapytanie zakończone sukcesem');
        if (onResponseChange) {
          onResponseChange('Zapytanie zakończone sukcesem');
        }
      }, duration);
    };

    return (
      <div className="space-y-4">
        <button
          onClick={simulateRequest}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
        >
          {loading ? 'Trwa zapytanie...' : 'Wyślij zapytanie'}
        </button>
        {result && (
          <div className="p-4 border rounded-md bg-gray-50">
            <pre>{result}</pre>
          </div>
        )}
      </div>
    );
  };

  // Komponent konfiguracji
  ConfigComponent: React.FC<PluginProps> = ({ config, onConfigChange }) => {
    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      if (onConfigChange) {
        onConfigChange({ duration: value });
      }
    };

    return (
      <div className="space-y-3">
        <h3 className="font-medium">Konfiguracja symulacji zapytania</h3>
        <div>
          <label className="block text-sm font-medium mb-1">
            Czas symulacji (w milisekundach)
          </label>
          <input
            type="number"
            value={config?.duration || 1000}
            onChange={handleDurationChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>
    );
  };

  // Komponent wyników
  ResultComponent: React.FC<PluginProps> = ({ nodeId }) => {
    const [result, setResult] = useState<string | null>(null);

    React.useEffect(() => {
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
          Brak wyników. Użyj zakładki "View", aby wysłać zapytanie.
        </div>
      );
    }

    return (
      <div className="p-4 border rounded-md bg-gray-50">
        <pre className="whitespace-pre-wrap">{result}</pre>
      </div>
    );
  };

  // Przetwarzanie węzła
  processNode(node: Node, response?: string): { node: Node, result: any } {
    return {
      node,
      result: response
    };
  }
}

export default new RequestSimulatorPlugin();
