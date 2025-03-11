// src/modules/templates_module/data/mockTemplateData.ts
import { Template } from "../templates_module/templateStore";

// Initial templates for the template store
export const initialTemplates: Template[] = [
  {
    name: 'Kampania marketingowa dla strony WWW',
    description: 'Szablon do generowania strategii marketingowej i słów kluczowych na podstawie analizy strony internetowej',
    nodes: {
      'urlInput': { 
        id: 'urlInput', 
        message: 'Podaj adres strony WWW, dla której mam wygenerować kampanię marketingową', 
        category: 'default' 
      },
      'analysis': { 
        id: 'analysis', 
        message: 'Przeprowadź dokładną analizę strony {{urlInput.response}} pod kątem:\n1. Branży\n2. Grupy docelowej\n3. Unikalnej wartości sprzedażowej\n4. Konkurencji', 
        category: 'analiza' 
      },
      'keywords': { 
        id: 'keywords', 
        message: 'Na podstawie analizy {{analysis.response}} wygeneruj:\n1. 5 głównych słów kluczowych\n2. 10 długich fraz kluczowych (long-tail)\n3. 5 słów kluczowych związanych z konkurencją', 
        category: 'marketing' 
      },
      'campaignStrategy': { 
        id: 'campaignStrategy', 
        message: 'Wykorzystując wygenerowane słowa kluczowe {{keywords.response}}, opracuj strategię kampanii marketingowej zawierającą:\n1. Główne cele kampanii\n2. Kanały promocji\n3. Proponowany budżet\n4. Harmonogram działań\n5. Mierniki sukcesu (KPI)', 
        category: 'marketing' 
      },
      'adConcepts': { 
        id: 'adConcepts', 
        message: 'W oparciu o strategię kampanii {{campaignStrategy.response}} stwórz 3 koncepcje kreatywne do wykorzystania w kampanii:\n1. Reklama tekstowa\n2. Post w mediach społecznościowych\n3. Treść mailingu', 
        category: 'marketing' 
      },
      'summary': { 
        id: 'summary', 
        message: 'Podsumuj całą kampanię w postaci zwięzłego raportu zawierającego wszystkie kluczowe elementy i rekomendacje. Uwzględnij analizę ({{analysis.response}}), słowa kluczowe ({{keywords.response}}), strategię ({{campaignStrategy.response}}) oraz koncepcje ({{adConcepts.response}})', 
        category: 'default' 
      }
    },
    edges: [
      { source: 'urlInput', target: 'analysis' },
      { source: 'analysis', target: 'keywords' },
      { source: 'keywords', target: 'campaignStrategy' },
      { source: 'campaignStrategy', target: 'adConcepts' },
      { source: 'adConcepts', target: 'summary' }
    ]
  },
  {
    name: 'Ekspresowa analiza SEO',
    description: 'Szablon do szybkiego generowania analizy SEO i słów kluczowych dla strony WWW',
    nodes: {
      'urlInput': { 
        id: 'urlInput', 
        message: 'Podaj adres strony WWW do analizy SEO', 
        category: 'default' 
      },
      'quickAnalysis': { 
        id: 'quickAnalysis', 
        message: 'Wykonaj szybką analizę strony {{urlInput.response}} pod kątem optymalizacji SEO', 
        category: 'analiza' 
      },
      'keywordSuggestions': { 
        id: 'keywordSuggestions', 
        message: 'Na podstawie analizy {{quickAnalysis.response}} zaproponuj 20 najlepszych słów kluczowych dla tej strony, podzielonych na kategorie', 
        category: 'marketing' 
      },
      'recommendations': { 
        id: 'recommendations', 
        message: 'Bazując na wynikach analizy SEO {{quickAnalysis.response}} oraz zaproponowanych słowach kluczowych {{keywordSuggestions.response}}, przedstaw 5 najważniejszych rekomendacji do poprawy SEO', 
        category: 'default' 
      }
    },
    edges: [
      { source: 'urlInput', target: 'quickAnalysis' },
      { source: 'quickAnalysis', target: 'keywordSuggestions' },
      { source: 'keywordSuggestions', target: 'recommendations' }
    ]
  }
];