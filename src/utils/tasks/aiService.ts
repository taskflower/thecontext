// src/utils/tasks/aiService.ts
import { IContainerDocument } from '../containers/types';
import { IAITaskStep } from './types';

/**
 * Serwis AI do obsługi zadań - tu byłoby faktyczne wywołanie API AI
 */
export class AIService {
    /**
     * Wyszukuje relewantne dokumenty na podstawie zapytania
     */
    async retrieveRelevantDocuments(
        query: string, 
        documents: IContainerDocument[]
    ): Promise<string[]> {
        // Symulacja wyszukiwania - w rzeczywistej implementacji
        // byłoby tu wywołanie API lub embeddings
        
        const relevantDocs = documents
            .filter(doc => {
                const content = doc.content.toLowerCase();
                const title = doc.title.toLowerCase();
                const searchTerms = query.toLowerCase().split(' ');
                
                return searchTerms.some(term => 
                    content.includes(term) || title.includes(term)
                );
            })
            .sort((a, b) => {
                // Proste sortowanie według ilości pasujących terminów
                const aMatches = this.countMatches(a, query);
                const bMatches = this.countMatches(b, query);
                return bMatches - aMatches;
            })
            .map(doc => doc.id);
            
        // Ogranicz liczbę wyników
        return relevantDocs.slice(0, 5);
    }
    
    private countMatches(doc: IContainerDocument, query: string): number {
        const content = doc.content.toLowerCase();
        const title = doc.title.toLowerCase();
        const searchTerms = query.toLowerCase().split(' ');
        
        return searchTerms.reduce((count, term) => {
            const titleMatches = (title.match(new RegExp(term, 'g')) || []).length;
            const contentMatches = (content.match(new RegExp(term, 'g')) || []).length;
            return count + titleMatches + contentMatches;
        }, 0);
    }
    
    /**
     * Przetwarza krok zadania z odpowiednim kontekstem
     */
    async processTaskStep(
        stepType: IAITaskStep['type'],
        input: string,
        context: IContainerDocument[]
    ): Promise<string> {
        // Tutaj byłoby wywołanie do modelu AI
        // Najpierw przygotujmy kontekst
        const contextText = context
            .map(doc => `Dokument "${doc.title}": ${doc.content}`)
            .join('\n\n');
            
        let prompt = '';
        
        switch (stepType) {
            case 'retrieval':
                prompt = `Na podstawie następujących dokumentów:\n\n${contextText}\n\nWybierz najważniejsze informacje związane z: ${input}`;
                break;
            case 'processing':
                prompt = `Przeanalizuj następujące dokumenty:\n\n${contextText}\n\nWyciągnij kluczowe informacje i wnioski w kontekście: ${input}`;
                break;
            case 'generation':
                prompt = `Na podstawie następujących informacji:\n\n${contextText}\n\nWygeneruj: ${input}`;
                break;
            case 'validation':
                prompt = `Sprawdź poprawność następujących informacji:\n\n${input}\n\nW kontekście dokumentów:\n\n${contextText}`;
                break;
            default:
                return "Nieznany typ kroku zadania";
        }
        
        // Symulacja odpowiedzi AI
        return this.simulateAIResponse(prompt, stepType);
    }
    
    private simulateAIResponse(prompt: string, stepType: IAITaskStep['type']): string {
        // W rzeczywistej implementacji tutaj byłoby wywołanie API modelu językowego
        
        // Symulowana odpowiedź
        const responses: Record<IAITaskStep['type'], string> = {
            retrieval: "Znalezione informacje: [tutaj byłyby kluczowe informacje z dokumentów]",
            processing: "Analiza dokumentów: [tutaj byłaby analiza dokumentów]",
            generation: "Wygenerowana zawartość: [tutaj byłaby wygenerowana zawartość]",
            validation: "Walidacja: [tutaj byłby wynik walidacji]"
        };
        
        return responses[stepType] || "Przetworzono zapytanie";
    }
}
