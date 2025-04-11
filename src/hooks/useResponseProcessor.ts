// src/hooks/useResponseProcessor.ts
import { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';

interface ProcessResponseOptions {
  contextPath?: string;
  hasSchema?: boolean;
  onProcessed?: (processedData: any) => void;
}

interface UseResponseProcessorReturn {
  processResponse: (response: any) => any;
  error: string | null;
  isProcessing: boolean;
}

/**
 * Hook do przetwarzania odpowiedzi z API, wyodrębniania danych i łączenia ich z istniejącym kontekstem
 */
export const useResponseProcessor = ({
  contextPath,
  hasSchema = false,
  onProcessed
}: ProcessResponseOptions): UseResponseProcessorReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { updateByContextPath, getContextPath } = useAppStore((state) => ({
    updateByContextPath: state.updateByContextPath,
    getContextPath: state.getContextPath
  }));
  
  /**
   * Wyodrębnia dane JSON z bloku markdown
   * @param content Treść zawierająca JSON w bloku markdown (```json ... ```)
   * @returns Sparsowany obiekt JSON lub null jeśli parsing nie powiódł się
   */
  const extractJsonFromMarkdown = useCallback((content: string): any | null => {
    try {
      // Znajdź bloki JSON w formacie markdown
      const jsonRegex = /```json\s*([\s\S]*?)\s*```/gm;
      const match = jsonRegex.exec(content);
      
      if (match && match[1]) {
        // Znaleziono blok JSON, próba sparsowania
        const jsonStr = match[1].trim();
        return JSON.parse(jsonStr);
      }
      
      return null;
    } catch (err) {
      console.error('[useResponseProcessor] Error extracting JSON from markdown:', err);
      return null;
    }
  }, []);
  
  /**
   * Próbuje sparsować string jako JSON
   * @param content String z potencjalnym JSON
   * @returns Sparsowany obiekt JSON lub null jeśli parsing nie powiódł się
   */
  const tryParseJson = useCallback((content: string): any | null => {
    try {
      return JSON.parse(content);
    } catch (err) {
      console.error('[useResponseProcessor] Error parsing JSON:', err);
      return null;
    }
  }, []);
  
  /**
   * Łączy nowe dane z istniejącymi w kontekście, zachowując unikalne klucze
   * @param newData Nowe dane do dodania do kontekstu
   * @returns Połączone dane (stare + nowe)
   */
  const mergeWithExistingContext = useCallback((newData: any): any => {
    if (!contextPath) return newData;
    
    try {
      // Pobierz istniejący kontekst
      const existingContext = getContextPath(contextPath);
      
      if (!existingContext || typeof existingContext !== 'object') {
        return newData;
      }
      
      if (typeof newData !== 'object' || newData === null) {
        return existingContext;
      }
      
      // Połącz obiekty, z preferencją dla nowych danych w przypadku konfliktów kluczy
      return { ...existingContext, ...newData };
    } catch (err) {
      console.error('[useResponseProcessor] Error merging with existing context:', err);
      return newData;
    }
  }, [contextPath, getContextPath]);
  
  /**
   * Przetwarza odpowiedź z API, wyodrębnia dane i łączy z istniejącym kontekstem
   */
  const processResponse = useCallback((response: any): any => {
    setIsProcessing(true);
    setError(null);
    
    try {
      if (!response || !response.success || !response.data || !response.data.message) {
        throw new Error('Nieprawidłowy format odpowiedzi API');
      }
      
      // Wyodrębnij content z odpowiedzi
      const messageContent = response.data.message.content;
      
      if (!messageContent) {
        throw new Error('Brak zawartości w odpowiedzi API');
      }
      
      let processedData: any;
      
      // Przetwarzanie w zależności od tego, czy oczekujemy JSON (hasSchema)
      if (hasSchema) {
        // Próba wyodrębnienia JSON z bloku markdown
        const jsonFromMarkdown = extractJsonFromMarkdown(messageContent);
        
        if (jsonFromMarkdown) {
          processedData = jsonFromMarkdown;
        } else {
          // Jeśli nie ma bloku markdown, spróbuj potraktować cały content jako JSON
          const jsonData = tryParseJson(messageContent);
          
          if (jsonData) {
            processedData = jsonData;
          } else {
            // Jeśli nie udało się sparsować jako JSON, użyj surowego tekstu
            console.warn('[useResponseProcessor] Expected JSON but received text content');
            processedData = { content: messageContent };
          }
        }
      } else {
        // Jeśli nie oczekujemy JSON, zapisz surowy tekst
        processedData = { content: messageContent };
      }
      
      // Łączenie z istniejącym kontekstem
      const mergedData = mergeWithExistingContext(processedData);
      
      // Zapisz dane w kontekście aplikacji, jeśli podano contextPath
      if (contextPath) {
        updateByContextPath(contextPath, mergedData);
      }
      
      // Wywołaj callback z przetworzonymi danymi, jeśli został dostarczony
      if (onProcessed) {
        onProcessed(mergedData);
      }
      
      // Zwróć przetworzone dane
      return mergedData;
    } catch (err) {
      console.error('[useResponseProcessor] Error processing response:', err);
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił błąd podczas przetwarzania odpowiedzi';
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [hasSchema, contextPath, extractJsonFromMarkdown, tryParseJson, mergeWithExistingContext, updateByContextPath, onProcessed]);
  
  return {
    processResponse,
    error,
    isProcessing
  };
};