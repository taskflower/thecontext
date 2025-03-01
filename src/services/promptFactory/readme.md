# PromptFactory

## Co to jest?

PromptFactory to framework TypeScript, który pozwala na łatwą integrację modeli AI (LLM) z aplikacjami. System umożliwia:

- Tworzenie szablonów promptów z dynamicznymi zmiennymi
- Komunikację z modelami AI
- Automatyczne wykonywanie akcji na podstawie odpowiedzi AI

## Jak to działa?

1. Definiujesz szablon promptu z zmiennymi (np. `{{projektId}}`)
2. System wysyła żądanie do modelu AI
3. Odpowiedź jest przetwarzana na konkretne akcje (np. utworzenie dokumentu)
4. Akcje są automatycznie wykonywane przez zarejestrowane handlery

## Przykład użycia: Asystent zarządzania projektami

Wyobraźmy sobie system zarządzania projektami, który używa PromptFactory do automatyzacji tworzenia struktury projektu:

```typescript
// Konfiguracja promptu
const config = {
  systemPrompt: "Jesteś asystentem do zarządzania projektami.",
  userPromptTemplate: "Stwórz strukturę projektu typu {{typProjektu}} dla klienta {{nazwaKlienta}}."
};

// Dane wejściowe
const variables = {
  typProjektu: "sklep e-commerce",
  nazwaKlienta: "FashionStore"
};

// Budowanie promptu i wysłanie do AI
const messages = buildPromptMessages(config, variables);
const response = await llmService.sendRequest(messages);

// Wykonanie akcji na podstawie odpowiedzi
const executionContext = {
  projectId: "proj-123",
  taskId: "task-001",
  stepId: "step-001"
};

// Rejestracja niestandardowej akcji
actionTypeRegistry.registerCustomHandler(
  'setup_repository',
  async (projectId, data) => {
    // Logika tworzenia repozytorium Git
    console.log(`Tworzenie repozytorium dla projektu ${projectId}`);
    return true;
  }
);

// Konfiguracja akcji
const responseAction = {
  type: "create_entities",
  entityMappings: [
    {
      entityType: "container",
      sourcePath: "containers",
      fieldMapping: {
        name: "name",
        description: "description"
      }
    },
    {
      entityType: "document",
      sourcePath: "documents",
      fieldMapping: {
        title: "title",
        content: "content",
        containerId: "containerId"
      }
    }
  ],
  customHandler: "setup_repository"
};

// Wykonanie akcji
await ResponseExecutor.executeResponse(
  executionContext,
  response,
  responseAction
);
```

W tym przykładzie, AI tworzy strukturę projektu e-commerce, a system automatycznie:
1. Tworzy kontenery (foldery) dla dokumentacji projektu
2. Generuje szablonowe dokumenty 
3. Uruchamia niestandardowe akcje (np. tworzenie repozytorium Git)

Całość działa bez potrzeby ręcznego przetwarzania odpowiedzi AI.