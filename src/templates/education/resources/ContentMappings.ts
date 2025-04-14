// src/templates/education/resources/ContentMappings.ts

export interface TabConfig {
    id: string;
    label: string;
  }
  
  export interface ContentFieldsConfig {
    title: string;
    tabs: Record<string, string>;
  }
  
  export interface UiConfig {
    background: string;
    saveType: string;
    idPrefix: string;
  }
  
  export const tabConfigs: Record<string, TabConfig[]> = {
    lesson: [
      { id: 'wprowadzenie', label: 'Wprowadzenie' },
      { id: 'cele', label: 'Cele nauczania' },
      { id: 'pojecia', label: 'Kluczowe pojęcia' },
      { id: 'tresc', label: 'Treść główna' },
      { id: 'przyklady', label: 'Przykłady' },
      { id: 'cwiczenia', label: 'Ćwiczenia' },
      { id: 'podsumowanie', label: 'Podsumowanie' }
    ],
    project: [
      { id: 'opis', label: 'Opis' },
      { id: 'cele', label: 'Cele' },
      { id: 'etapy', label: 'Etapy' },
      { id: 'wskazowki', label: 'Wskazówki' },
      { id: 'ocena', label: 'Kryteria oceny' },
      { id: 'materialy', label: 'Materiały' }
    ]
  };
  
  export const contentFields: Record<string, ContentFieldsConfig> = {
    lesson: {
      title: 'tytul',
      tabs: {
        wprowadzenie: 'wprowadzenie',
        cele: 'cele_nauczania',
        pojecia: 'kluczowe_pojecia',
        tresc: 'tresc_glowna',
        przyklady: 'przyklady',
        cwiczenia: 'interaktywne_cwiczenia',
        podsumowanie: 'podsumowanie'
      }
    },
    project: {
      title: 'tytul_projektu',
      tabs: {
        opis: 'opis',
        cele: 'cele',
        etapy: 'etapy',
        wskazowki: 'wskazowki',
        ocena: 'kryteria_oceny',
        materialy: 'materialy_dodatkowe'
      }
    }
  };
  
  export const uiSettings: Record<string, UiConfig> = {
    lesson: {
      background: 'from-blue-500 to-purple-600',
      saveType: 'lesson',
      idPrefix: 'lesson'
    },
    project: {
      background: 'from-indigo-500 to-purple-600',
      saveType: 'project',
      idPrefix: 'project'
    }
  };
  
  export const getItemBackground = (tab: string): string => {
    switch (tab) {
      case 'pojecia': return 'bg-blue-50';
      case 'przyklady': return 'bg-green-50 border-l-4 border-green-500';
      case 'cwiczenia': return 'bg-yellow-50';
      case 'wskazowki': return 'bg-yellow-50 border-l-4 border-yellow-400';
      default: return 'bg-gray-50';
    }
  };