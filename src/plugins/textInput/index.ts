// src/plugins/textInput/index.ts
import { registerPlugin } from '../../modules/pluginSystem/registry';
import { TextInputEditor } from './TextInputEditor';
import { TextInputViewer } from './TextInputViewer';
import { TextInputResult } from './TextInputResult';
import { TextInputValidation } from './TextInputValidation';

// Zarejestruj wtyczkę
registerPlugin({
  id: 'text-input',
  name: 'Pole tekstowe',
  description: 'Pozwala na wprowadzenie tekstu przez użytkownika',
  icon: null, // Można dodać ikonę komponentu React
  category: 'Dane',
  
  // Możliwości wtyczki
  capabilities: {
    autoExecutable: false,      // Wymaga interakcji użytkownika
    requiresUserInput: true,    // Wymaga wprowadzenia danych
    producesOutput: true,       // Produkuje dane dla innych kroków
    consumesOutput: false       // Nie wymaga danych z innych kroków
  },
  
  // Domyślna konfiguracja
  defaultConfig: {
    label: 'Wprowadź tekst',
    placeholder: 'Wpisz tutaj...',
    minLength: 0,
    maxLength: 1000,
    required: true,
    multiline: true,
    rows: 6
  },
  
  // Komponent edytora do konfiguracji kroku
  EditorComponent: TextInputEditor,
  
  // Komponent widoku do wykonania kroku
  ViewerComponent: TextInputViewer,
  
  // Komponent wyniku do wyświetlania rezultatu
  ResultComponent: TextInputResult,
  
  // Funkcja walidacji
  validate: TextInputValidation
});