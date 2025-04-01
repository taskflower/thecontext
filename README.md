# The Context App

Aplikacja do zarządzania workspace'ami, scenariuszami i kontekstem.

## Organizacja workspace'ów

Twoja propozycja organizacji pracy w przestrzeniach roboczych (workspaces) doskonale rozwiązuje problem separacji procesów analitycznych. Zaimplementowana architektura pozwala:

Tworzyć przestrzenie robocze dla różnych kontekstów analizy:
- Strony WWW
- Grupy docelowe
- Cele biznesowe

Zarządzać kontekstem w elastyczny sposób:
- Kontekst definiowany na poziomie workspace
- Automatyczne dziedziczenie przez scenariusze
- Możliwość dostosowania przez plugin

Organizować pracę w logiczny sposób:
- Scenariusze są przypisywane do konkretnych workspace'ów
- Workspace przechowuje wspólne dane dla wszystkich scenariuszy

Używać plugin do context-aware prompting:
- Dedykowany plugin wyciąga potrzebne elementy kontekstu
- Formatowanie odpowiednio do potrzeb (JSON, tekst, szablon)

## Szablony i importy

Ten projekt zawiera gotowe do użycia szablony:

### Szablon nauki języków

Zintegrowany szablon do nauki języków oferuje kompletne środowisko nauki, podobne do Duolingo:

- **Komponenty**: Gotowe do użycia, zainstalowane w katalogu `/src/dynamicComponents/`
- **Plik importu**: Dostępny w `/imports/language_learning_import.json`
- **Instrukcja**: Szczegółowa instrukcja w `/imports/INSTRUKCJA.md`

Aby skorzystać z szablonu, postępuj zgodnie z instrukcją importu.