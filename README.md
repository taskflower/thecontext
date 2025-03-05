# Info prompt


## .

Aby szybko wyeliminować najbardziej zbędny kod:

Utwórz komponent Modal wielokrotnego użytku

Zastąpienie EditScenarioModal, TaskEditModal, NewDocumentModal jednym konfigurowalnym komponentem.
Wyodrębnienie wspólnej struktury okna dialogowego, walidacji i wzorców przesyłania formularzy


Ogólne komponenty elementów

Stworzenie ujednoliconego komponentu ListItem, który zastąpi DocumentItem, ScenarioItem i TaskItem.
Współdzielenie struktury kart, ale umożliwienie dostosowywania zawartości za pomocą rekwizytów renderowania


Konsolidacja operacji CRUD store

Utwórz funkcję fabryczną dla typowych operacji dodawania/aktualizowania/usuwania
Przykład: createCrudOperations<T>(entityName, storage, validators)


Współdzielone komponenty narzędziowe interfejsu użytkownika

Wyodrębnienie komponentów StatusBadge, PriorityBadge, EmptyState z powtarzających się wzorców UI
Centralizacja wspólnych wzorców, takich jak nagłówki szczegółów i nawigacja po liście




Przetłumaczono z DeepL.com (wersja darmowa)

#

npx shadcn@latest add toggle-group