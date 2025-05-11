// src/_configs/energyGrantApp/scenarios/find-auditor.scenario.ts
import { ScenarioConfig } from "../../../core/types";

export const findAuditorScenario: ScenarioConfig = {
  slug: "scenario-find-auditor",
  workspaceSlug: "workspace-energygrant",
  name: "Wyszukiwarka Audytorów",
  description: "Formularz zgłoszenia zapotrzebowania na audyt energetyczny",
  icon: "clipboard-check",
  // Dostępność dla ról
  roleAccess: ["beneficjent", "operator"],
  nodes: [
    {
      slug: "auditor-order-form",
      label: "Krok 1: Formularz zapotrzebowania",
      contextSchemaPath: "order-request",
      contextDataPath: "order-request",
      tplFile: "FormStep",
      order: 0,
      attrs: {
        title: "Formularz zapotrzebowania na audyt energetyczny",
        description: "Wypełnij formularz, aby znaleźć audytora energetycznego",
        jsonSchema: {
          type: "object",
          properties: {
            address: { 
              type: "string", 
              title: "Adres nieruchomości"
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
            buildingType: {
              type: "string",
              title: "Typ budynku",
              enum: [
                "Dom jednorodzinny",
                "Dom bliźniak",
                "Segment w szeregowcu", 
                "Budynek wielorodzinny",
                "Budynek gospodarczy",
                "Inny"
              ]
            },
            buildingArea: {
              type: "number",
              title: "Powierzchnia budynku (m²)",
              minimum: 1
            },
            constructionYear: {
              type: "number",
              title: "Rok budowy",
              minimum: 1900,
              maximum: 2025
            },
            urgency: {
              type: "string",
              title: "Pilność wykonania audytu",
              enum: [
                "Natychmiast",
                "W ciągu miesiąca",
                "W ciągu 3 miesięcy",
                "Elastycznie"
              ]
            },
            comments: {
              type: "string",
              title: "Uwagi dodatkowe"
            }
          },
          required: ["address", "postalCode", "city", "phone", "buildingType", "buildingArea"]
        },
        submitLabel: "Opublikuj zapotrzebowanie",
      },
    },
    {
      slug: "auditor-order-preset",
      label: "Ustawienie typu zlecenia",
      contextSchemaPath: "order-request",
      contextDataPath: "order-request",
      tplFile: "LlmStep",
      order: 1,
      attrs: {
        autoStart: true,
        userMessage:
          "Ustaw typ zlecenia na 'auditor' na podstawie danych z formularza. " +
          "Zwróć JSON zawierający pole orderType o wartości 'auditor'.",
      },
    },
    {
      slug: "auditor-order-summary",
      label: "Krok 2: Podsumowanie zapotrzebowania",
      contextSchemaPath: "order-request",
      contextDataPath: "order-request",
      tplFile: "WidgetsStep",
      order: 2,
      saveToDB: {
        enabled: true,
        provider: "indexedDB",
        itemType: "order",
        itemTitle: "Zapotrzebowanie na audyt",
        contentPath: "order-request"
      },
      attrs: {
        widgets: [
          {
            tplFile: "TitleWidget",
            title: "Zapotrzebowanie zostało opublikowane",
            subtitle: "Twoje zapotrzebowanie jest już widoczne na giełdzie audytorów. Zainteresowani audytorzy będą mogli się z Tobą skontaktować.",
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
            title: "Typ budynku",
            contextDataPath: "order-request.buildingType",
            icon: "home",
            colSpan: 1,
          },
          {
            tplFile: "InfoWidget",
            title: "Powierzchnia",
            data: "{{order-request.buildingArea}} m²",
            icon: "square",
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