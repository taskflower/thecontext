
Specyfikacja:

Rejestracja pluginu:

Użyj funkcji register z pliku registry.ts.
Plugin powinien być zarejestrowany jako obiekt zawierający następujące właściwości:
type: unikalny identyfikator, np. "my-new-plugin".
name: nazwa pluginu, np. "My New Plugin".
Viewer: komponent React przyjmujący propsy { step, onComplete } – renderuje widok pluginu.
Editor: komponent React przyjmujący propsy { step, onChange } – umożliwia edycję ustawień pluginu.
ResultRenderer: komponent React przyjmujący propsy { step } – prezentuje wynik działania pluginu.
defaultConfig: obiekt z domyślną konfiguracją (np. tytuł, opis, inne opcje konfiguracyjne).
category: kategoria pluginu, np. wartość z PLUGIN_CATEGORIES (np. PLUGIN_CATEGORIES.CONTENT).
description: krótki opis pluginu.
Walidacja:

Zdefiniuj schemat walidacji za pomocą biblioteki zod.
Schemat powinien sprawdzać obecność pól takich jak id, type, title, taskId, order oraz konfigurację i wynik.
Zarejestruj schemat przy użyciu funkcji registerSchema.
Obsługa akcji (opcjonalnie):

Jeżeli plugin wykonuje jakieś akcje (np. zakończenie kroku), użyj globalnych handlerów: registerPluginHandler i unregisterPluginHandler.
Wymagania:

Kod musi być kompletny i spójny z przyjętym szablonem.
Wszystkie komponenty (Viewer, Editor, ResultRenderer) oraz walidacja muszą być zgodne z istniejącą architekturą.
Plugin powinien być łatwy do rozszerzenia, aby kolejne pluginy mogły być tworzone według tego samego schematu.