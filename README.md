# Info prompt

## GPT

Aplikacja to system zarządzania zadaniami oparty na React z wykorzystaniem tablic Kanban, umożliwiający tworzenie i edytowanie szablonów z zadaniami krokowymi, śledzenie zależności oraz integrację z wtyczkami do automatycznego rozszerzania kontekstu dokumentów.

## DeepSeek

Aplikacja to system zarządzania zadaniami z możliwością tworzenia szablonów tablic Kanban, śledzenia postępów poprzez statusy (todo, inProgress, done) oraz wykonywania zadań krok-po-kroku z integracją wtyczek, przeznaczony do budowy strukturyzowanych ścieżek wiedzy i zarządzania kontekstem dokumentów.  

##

Pracujemy nad systemem zarządzania zadaniami opartym na tablicach Kanban z możliwością tworzenia szablonów i zarządzania dokumentami. System wykorzystuje Zustand do zarządzania stanem.

- Właśnie zaimplementowaliśmy podstawową strukturę dla modułu dokumentów, który zawiera:
- DocumentContainer jako główny koncept grupujący dokumenty
- Możliwość łączenia kontenerów dokumentów z wieloma instancjami Kanban
- Store zaimplementowany w Zustand z persist
- Kod został zorganizowany w następujących plikach:
- src/store/kanbanStore.ts - zarządzanie tablicami Kanban
- src/store/tasksStore.ts - zarządzanie szablonami zadań
- src/store/documentsStore.ts - nowo dodany store do zarządzania dokumentami
- src/types/document.ts - typy związane z dokumentami
- src/types/template.ts - typy dla szablonów
- src/types/kanban.ts - typy dla systemu Kanban

Dokumenty w systemie są markdown'owe i są wynikiem pracy pluginów w poszczególnych krokach zadań.



# TODO 1

Przeanalizuj kod pluginu formularzy. Obecnie formatowanie wiadomości LLM jest zaimplementowane w komponencie StepsPreview:
typescriptCopyconst formatLLMMessages = (steps: Step[]) => {
  return steps.reduce((messages: LLMMessage[], step) => {
    const plugin = plugins[step.pluginId];
    if (plugin.resolver?.formatMessages) {
      const stepMessages = plugin.resolver.formatMessages(step.data);
      if (stepMessages) {
        messages.push(...stepMessages);
      }
    }
    return messages;
  }, []);
};
To prowadzi do:

Rozrzucenia logiki po aplikacji
Problemu z przekazywaniem konfiguracji (step.config)
Trudności w utrzymaniu kodu

Potrzebujemy:

Przenieść formatowanie wiadomości do pluginu
Dodać metodę do formatowania wielu kroków na poziomie pluginu
Zapewnić spójne przekazywanie konfiguracji

Zmodyfikuj kod aby:

Dodać metodę formatStepsMessages do interfejsu PluginResolver w base.ts
Zaimplementować tę metodę w pluginie formularza
Usunąć formatowanie z StepsPreview i używać nowej metody
Upewnić się że config jest prawidłowo obsługiwany

Wymagane pliki do modyfikacji:

src/plugins/base.ts
src/plugins/form/index.ts
src/components/preview/StepsPreview.tsx