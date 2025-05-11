// src/_configs/energyGrantApp/scenarios/find-contractor.scenario.ts
import { ScenarioConfig } from "../../../core/types";

export const findContractorScenario: ScenarioConfig = {
  slug: "scenario-find-contractor",
  workspaceSlug: "workspace-energygrant",
  name: "Wyszukiwarka Wykonawców",
  description: "Formularz zlecenia do publikacji na giełdzie wykonawców",
  icon: "hammer",
  // Dostępność dla ról
  roleAccess: ["beneficjent", "operator"],
  nodes: [
    {
      slug: "contractor-order-form",
      label: "Krok 1: Formularz zlecenia",
      contextSchemaPath: "order-request",
      contextDataPath: "order-request",
      tplFile: "FormStep",
      order: 0,
      attrs: {
        title: "Formularz zlecenia dla wykonawców",
        description: "Wypełnij formularz, aby opublikować zlecenie na giełdzie wykonawców",
        jsonSchema: {
          type: "object",
          properties: {
            address: { 
              type: "string", 
              title: "Adres inwestycji"
            },
            postalCode: { 
              type: "string", 
              title: "Kod pocztowy",
              pattern: "^[0-9]{2}-[0-9]{3}$"
            },
            city: { 
              type: "string", 
              title: "Miejscowość"
            },
            phone: { 
              type: "string", 
              title: "Telefon kontaktowy"
            },
            scope: { 
              type: "string", 
              title: "Zakres prac",
              enum: [
                "Termomodernizacja ścian",
                "Termomodernizacja dachu",
                "Wymiana okien",
                "Instalacja fotowoltaiki",
                "Wymiana źródła ciepła",
                "Kompleksowa termomodernizacja",
                "Inne (opisz w uwagach)"
              ]
            },
            scopeDescription: {
              type: "string",
              title: "Dodatkowy opis zakresu prac",
              description: "Opisz szczegółowy zakres planowanych prac"
            },
            hasAudit: { 
              type: "boolean", 
              title: "Czy posiadasz audyt energetyczny?"
            },
            auditFile: { 
              type: "string", 
              title: "Załącz plik audytu (bez danych osobowych)",
              description: "Akceptowane formaty: PDF, maksymalny rozmiar: 10MB"
            },
            comments: {
              type: "string",
              title: "Uwagi dodatkowe"
            }
          },
          required: ["address", "postalCode", "city", "phone", "scope", "hasAudit"]
        },
        submitLabel: "Opublikuj zlecenie",
      },
    },
    {
      slug: "contractor-order-preset",
      label: "Ustawienie typu zlecenia",
      contextSchemaPath: "order-request",
      contextDataPath: "order-request",
      tplFile: "LlmStep",
      order: 1,
      attrs: {
        autoStart: true,
        userMessage:
          "Ustaw typ zlecenia na 'contractor' na podstawie danych z formularza. " +
          "Zwróć JSON zawierający pole orderType o wartości 'contractor'.",
      },
    },
    {
      slug: "contractor-order-summary",
      label: "Krok 2: Podsumowanie zlecenia",
      contextSchemaPath: "order-request",
      contextDataPath: "order-request",
      tplFile: "WidgetsStep",
      order: 2,
      saveToDB: {
        enabled: true,
        provider: "indexedDB",
        itemType: "order",
        itemTitle: "Zlecenie dla wykonawcy",
        contentPath: "order-request"
      },
      attrs: {
        widgets: [
          {
            tplFile: "TitleWidget",
            title: "Zlecenie zostało opublikowane",
            subtitle: "Twoje zlecenie jest już widoczne na giełdzie wykonawców. Zainteresowani wykonawcy będą mogli się z Tobą skontaktować.",
            colSpan: "full",
          },
          {
            tplFile: "InfoWidget",
            title: "Lokalizacja",
            contextDataPath: "order-request.city",
            icon: "map-pin",
            colSpan: 1,
          },
          {
            tplFile: "InfoWidget",
            title: "Zakres prac",
            contextDataPath: "order-request.scope",
            icon: "tool",
            colSpan: 1,
          },
          {
            tplFile: "InfoWidget",
            title: "Audyt energetyczny",
            data: "{{order-request.hasAudit ? 'Załączony' : 'Brak'}}",
            icon: "file-text",
            colSpan: 1,
          },
          {
            tplFile: "OrderDetailsWidget",
            contextDataPath: "order-request",
            colSpan: "full",
          }
        ],
      },
    },
  ],
};