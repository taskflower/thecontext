# Instrukcja importu szablonu nauki języków

## KROK 1: Import danych

1. W aplikacji The Context App przejdź do ustawień i wybierz zakładkę "Export/Import"
2. Wybierz opcję "Import"
3. Wczytaj plik `language_learning_import.json` z katalogu `/imports/`
4. Zaznacz opcję "Import as new workspace(s)"
5. Kliknij "Import Data"
6. Po zakończeniu importu odśwież stronę

## KROK 2: Korzystanie z aplikacji

Po imporcie zobaczysz nowy obszar roboczy o nazwie "Language Learning App". Aby z niego korzystać:

1. Wybierz "Language Learning App" z listy obszarów roboczych
2. Wybierz scenariusz "Beginner Spanish Course"
3. Kliknij "Start Flow" by rozpocząć naukę
4. Postępuj zgodnie z instrukcjami na ekranie:
   - Kliknij "Start Lesson" aby rozpocząć lekcję
   - Odpowiadaj na pytania i klikaj "Check Answer"
   - Po zakończeniu ćwiczeń kliknij "Finish Lesson"

## Uwagi

- Aplikacja używa IndexedDB do przechowywania danych o lekcjach i postępach
- Komponenty do nauki języków są już zainstalowane w katalogu `/src/dynamicComponents/`
- Nie musisz ręcznie rejestrować żadnych komponentów - wszystko jest gotowe do użycia
- Postęp nauki jest zapisywany automatycznie

## Rozwiązywanie problemów

Jeśli napotkasz problemy:

1. Upewnij się, że odświeżyłeś stronę po imporcie
2. Sprawdź konsolę przeglądarki (F12) w poszukiwaniu błędów
3. Upewnij się, że dane w IndexedDB zostały poprawnie utworzone
4. Kliknij "Start Flow" ponownie, jeśli interfejs nie reaguje

## Co dalej?

Możesz rozszerzyć funkcjonalność szablonu, dodając:

1. Więcej lekcji i ćwiczeń w IndexedDB
2. Nowe typy ćwiczeń jako dodatkowe komponenty
3. Własny interfejs użytkownika