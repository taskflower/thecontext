/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/URLInputPlugin.tsx
import React from 'react';
import { Node } from '@/store/types';
import { NodePlugin, ValidationResult } from './types';

/**
 * Plugin do wprowadzania adresów URL z walidacją
 */
export class URLInputPlugin implements NodePlugin {
  id = 'url-input';
  name = 'Pole URL';
  description = 'Pozwala na wprowadzenie adresu URL z walidacją formatu';
  
  /**
   * Transformuje węzeł, dodając potrzebną konfigurację URL
   */
  transformNode(node: Node): Node {
    if (node.pluginType !== this.id) return node;
    
    // Domyślny pattern URL
    const defaultPattern = '^(https?:\\/\\/)?(www\\.)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\\.[a-zA-Z]{2,}(\\.[a-zA-Z]{2,})?(\\/.*)?(\\?.*)?$';
    
    // Zapewnij poprawną konfigurację pluginu
    const pluginConfig = {
      inputType: 'url',
      placeholder: node.pluginData?.placeholder || 'https://',
      validation: {
        pattern: node.pluginData?.pattern || defaultPattern,
        required: Boolean(node.pluginData?.required)
      }
    };

    // Domyślna wiadomość jeśli nie została ustawiona
    const assistantMessage = node.assistantMessage || 'Proszę podać poprawny adres URL';

    return {
      ...node,
      assistantMessage,
      pluginConfig
    };
  }
  
  /**
   * Waliduje konfigurację pluginu URL
   */
  validateNodeData(pluginData: Record<string, any> = {}): ValidationResult {
    const errors: string[] = [];
    
    // Walidacja wyrażenia regularnego
    if (pluginData.pattern) {
      try {
        // Sprawdź czy wzorzec jest poprawnym RegExp
        new RegExp(pluginData.pattern);
      } catch  {
        errors.push('Niepoprawne wyrażenie regularne w polu "Wzorzec walidacji"');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  /**
   * Renderuje formularz konfiguracyjny pluginu URL
   */
  renderConfigForm(
    pluginData: Record<string, any> = {}, 
    onChange: (newData: Record<string, any>) => void
  ): React.ReactNode {
    return (
      <div className="mt-4 p-4 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--muted))]">
        <h3 className="text-sm font-semibold mb-3">Konfiguracja pola URL</h3>
        
        {/* Placeholder field */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="url-placeholder">
            Tekst podpowiedzi (placeholder)
          </label>
          <input
            id="url-placeholder"
            type="text"
            value={pluginData.placeholder || 'https://'}
            onChange={(e) => onChange({ ...pluginData, placeholder: e.target.value })}
            className="flex h-10 w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
          <p className="mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">
            Podpowiedź wyświetlana w polu URL
          </p>
        </div>
        
        {/* Pattern field */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="url-pattern">
            Wzorzec walidacji (RegEx)
          </label>
          <input
            id="url-pattern"
            type="text"
            value={pluginData.pattern || ''}
            onChange={(e) => onChange({ ...pluginData, pattern: e.target.value })}
            className="flex h-10 w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
          <p className="mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">
            Wyrażenie regularne do walidacji URL (opcjonalnie)
          </p>
        </div>
        
        {/* Required checkbox */}
        <div className="flex items-center mb-4 mt-4">
          <input
            type="checkbox"
            id="url-required"
            checked={Boolean(pluginData.required)}
            onChange={(e) => onChange({ ...pluginData, required: e.target.checked })}
            className="h-4 w-4 mr-2 border-[hsl(var(--border))]"
          />
          <label htmlFor="url-required" className="text-sm">Wymagane pole</label>
        </div>
        
        {/* Preview section */}
        <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
          <h4 className="text-xs font-medium mb-2">Podgląd pola URL:</h4>
          <div className="bg-white p-3 rounded-md border border-[hsl(var(--input))]">
            <input
              type="url"
              placeholder={pluginData.placeholder || 'https://'}
              className="w-full p-2 border border-[hsl(var(--input))] rounded-md text-sm"
              disabled
            />
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              Wprowadź poprawny adres URL
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  /**
   * Renderuje pole wejściowe URL w widoku flow
   */
  renderInputComponent(
    node: Node, 
    value: string, 
    onChange: (value: string) => void
  ): React.ReactNode {
    const config = node.pluginConfig || {};
    const pattern = config.validation?.pattern;
    const required = config.validation?.required;
    
    // Walidacja adresu URL
    const isValidURL = this.validateURL(value, pattern);
    
    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Adres URL:</h3>
        <div className="bg-white p-3 rounded-md border border-[hsl(var(--border))]">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={config.placeholder || 'https://'}
            pattern={pattern}
            required={required}
            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${
              value && !isValidURL 
                ? 'border-red-300 focus:ring-red-200' 
                : 'border-[hsl(var(--input))] focus:ring-[hsl(var(--ring))]'
            }`}
          />
          
          {/* Helper text */}
          <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
            Wprowadź poprawny adres URL
          </p>
          
          {/* Validation feedback */}
          {value && (
            <div className="mt-2 text-xs">
              {isValidURL ? (
                <span className="text-green-600">✓ Poprawny URL</span>
              ) : (
                <span className="text-red-600">✗ Niepoprawny format URL</span>
              )}
            </div>
          )}
        </div>
        
        {/* Context key information */}
        {node.contextKey && (
          <div className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
            URL zostanie zapisany w:{" "}
            <code className="bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded text-xs">
              {node.contextKey}
            </code>
          </div>
        )}
      </div>
    );
  }
  
  /**
   * Waliduje adres URL
   * @param url URL do walidacji
   * @param pattern Opcjonalny wzorzec RegExp 
   * @returns true jeśli URL jest poprawny
   */
  private validateURL(url: string, pattern?: string): boolean {
    if (!url) return false;
    
    try {
      // Podstawowa walidacja URL
      new URL(url);
      
      // Dodatkowa walidacja przez wzorzec, jeśli podany
      if (pattern) {
        const regex = new RegExp(pattern);
        return regex.test(url);
      }
      
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instancji pluginu URL
export const urlInputPlugin = new URLInputPlugin();