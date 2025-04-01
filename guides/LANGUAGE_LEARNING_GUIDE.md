# Przewodnik korzystania z szablonu nauki języków

Ten dokument wyjaśnia, jak korzystać z szablonu aplikacji do nauki języków w The Context App i rozwiązuje wszelkie zamieszanie dotyczące różnych katalogów i plików.

## Przegląd dostępnych opcji

W systemie dostępne są **dwie metody** korzystania z szablonu nauki języków:

### OPCJA 1: Bezpośrednie komponenty (ZALECANA)

**Lokalizacja:** `/src/dynamicComponents/` 

**Opis:** Komponenty zostały już bezpośrednio dodane do projektu w katalogu `src/dynamicComponents/`, co oznacza, że są automatycznie wykrywane i rejestrowane przez system pluginów. Ta metoda jest już skonfigurowana i gotowa do użycia.

**Pliki:**
- `/src/dynamicComponents/LessonIntroPlugin.tsx`
- `/src/dynamicComponents/ExercisePlugin.tsx`
- `/src/dynamicComponents/LessonCompletePlugin.tsx`

**Jak używać:**
1. Otwórz aplikację i wybierz obszar roboczy "Language Learning App" z początkowej listy
2. Wybierz scenariusz "Beginner Spanish Course"
3. Kliknij "Start Flow" aby rozpocząć sesję nauki
4. Przejdź przez ćwiczenia klikając "Start Lesson", "Check Answer" itd.

**Zalety:** Działa natychmiast bez konieczności importowania czegokolwiek.

### OPCJA 2: Moduł AppTemplates 

**Lokalizacja:** `/src/modules/appTemplates/languageLearning/`

**Opis:** Ta metoda zapewnia bardziej modułowe podejście, ale wymaga dodatkowej konfiguracji. Jest to moduł aplikacyjny, który powinien być używany programistycznie poprzez rejestrację i inicjalizację komponentów szablonu.

**Jak używać:**
1. W kodzie aplikacji dodaj:
   ```typescript
   import { registerLanguageLearningTemplate, initializeLanguageLearningData } from '@/modules/appTemplates/languageLearning';
   
   // Zarejestruj komponenty
   registerLanguageLearningTemplate();
   
   // Inicjalizuj dane w IndexedDB
   await initializeLanguageLearningData();
   ```

2. Korzystaj z utworzonego obszaru roboczego lub utwórz nowy:
   ```typescript
   import { createLanguageLearningWorkspace } from '@/modules/appTemplates/languageLearning';
   const { workspaceId } = await createLanguageLearningWorkspace();
   ```

**Zalety:** Bardziej modułowe podejście, lepsze do integracji programistycznej.

### OPCJA 3: Pliki importu (dla użytkowników końcowych)

**Lokalizacja:** `/temp_imports/`

**Opis:** Te pliki są przeznaczone dla użytkowników końcowych do importu szablonu bez modyfikacji kodu. Zawierają kompletne pliki JSON do importu oraz instrukcje.

**Jak używać:**
1. Otwórz aplikację i przejdź do zakładki Export/Import
2. Wybierz "Import"
3. Załaduj plik `/temp_imports/language_learning_complete_import.json` 
4. Wybierz "Import as new workspace"
5. Kliknij "Import Data"

**Zalety:** Łatwe w użyciu dla użytkowników końcowych, nie wymaga dostępu do kodu.

## Zalecane podejście

Zalecamy korzystanie z **OPCJI 1 (Bezpośrednie komponenty)**, ponieważ:
1. Jest już skonfigurowana i gotowa do użycia
2. Najlepiej integruje się z aplikacją
3. Nie wymaga dodatkowych kroków importowania lub konfiguracji

## Kroki rozwiązywania problemów

Jeśli napotkasz problemy:

1. **Sprawdź konsolę przeglądarki** (F12), aby zobaczyć szczegółowe logi
2. **Upewnij się, że dane IndexedDB zostały zainicjalizowane**:
   - Otwórz narzędzia programistyczne (F12) 
   - Przejdź do zakładki "Application" 
   - Sprawdź "IndexedDB" > "contextDB" > "language_lessons"
3. **Upewnij się, że kontekst jest aktualizowany**:
   - Kliknięcie "Start Lesson" i inne przyciski powinno aktualizować kontekst
   - Logi w konsoli pokażą, czy kontekst jest prawidłowo aktualizowany

## Czyszczenie projektu (opcjonalne)

Jeśli chcesz uprościć projekt i usunąć nadmiarowe metody:

1. Możesz bezpiecznie usunąć katalog `/temp_imports/`, jeśli nie planujesz korzystać z funkcji importu
2. Zależnie od twoich potrzeb, możesz zachować lub usunąć katalog `/src/modules/appTemplates/`

## Konkluzja

Masz kilka opcji korzystania z szablonu nauki języków, ale najłatwiejszą i już działającą metodą jest korzystanie z bezpośrednich komponentów w katalogu `src/dynamicComponents/`.