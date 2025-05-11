// src/_configs/energyGrantApp/scenarios/portfolio.scenario.ts
import { ScenarioConfig } from "../../../core/types";

export const portfolioScenario: ScenarioConfig = {
  slug: "scenario-portfolio",
  workspaceSlug: "workspace-energygrant",
  name: "Portfolio",
  description: "Zarządzaj swoim profilem wykonawcy lub audytora energetycznego",
  icon: "user",
  // Dostępność dla ról
  roleAccess: ["wykonawca", "audytor"],
  nodes: [
    {
      slug: "portfolio-type-detector",
      label: "Wykrywanie typu portfolio",
      contextSchemaPath: "portfolio",
      contextDataPath: "portfolio",
      tplFile: "LlmStep",
      order: 0,
      attrs: {
        autoStart: true,
        userMessage:
          "Na podstawie roli użytkownika ({{user-data.role}}) określ typ portfolio. " +
          "Jeśli rola to 'wykonawca', ustaw portfolioType na 'contractor'. " +
          "Jeśli rola to 'audytor', ustaw portfolioType na 'auditor'. " +
          "Zwróć JSON z polem portfolioType o wartości 'contractor' lub 'auditor'.",
      },
    },
    {
      slug: "portfolio-data-entry",
      label: "Krok 1: Dane profilowe",
      contextSchemaPath: "portfolio",
      contextDataPath: "portfolio",
      tplFile: "FormStep",
      order: 1,
      attrs: {
        title: "Dane profilowe",
        description: "Wprowadź dane swojej firmy, które będą widoczne dla beneficjentów",
        jsonSchema: {
          type: "object",
          properties: {
            companyName: { 
              type: "string", 
              title: "Nazwa firmy"
            },
            nip: { 
              type: "string", 
              title: "NIP",
              pattern: "^[0-9]{10}$"
            },
            address: { 
              type: "string", 
              title: "Adres siedziby"
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
            email: { 
              type: "string", 
              title: "E-mail kontaktowy",
              format: "email"
            },
            website: { 
              type: "string", 
              title: "Strona internetowa"
            },
            description: { 
              type: "string", 
              title: "Opis działalności",
              description: "Krótki opis działalności, doświadczenia, specjalizacji"
            }
          },
          required: ["companyName", "nip", "address", "postalCode", "city", "phone", "email"]
        },
        submitLabel: "Dalej",
      },
    },
    {
      slug: "portfolio-services",
      label: "Krok 2: Usługi",
      contextSchemaPath: "portfolio",
      contextDataPath: "portfolio",
      tplFile: "FormStep",
      order: 2,
      attrs: {
        title: "Oferowane usługi",
        description: "Wybierz usługi, które oferuje Twoja firma",
        jsonSchema: {
          type: "object",
          properties: {
            services: { 
              type: "array", 
              title: "Oferowane usługi",
              items: {
                type: "string",
                enum: [
                  "Termomodernizacja ścian",
                  "Termomodernizacja dachu",
                  "Wymiana okien",
                  "Instalacja fotowoltaiki",
                  "Wymiana źródła ciepła",
                  "Pompy ciepła",
                  "Rekuperacja",
                  "Audyt energetyczny",
                  "Audyt remontowy",
                  "Doradztwo energetyczne",
                  "Projekty termomodernizacji",
                  "Dokumentacja techniczna"
                ]
              },
              uniqueItems: true
            }
          },
          required: ["services"]
        },
        submitLabel: "Dalej",
      },
    },
    {
      slug: "portfolio-certificates",
      label: "Krok 3: Certyfikaty",
      contextSchemaPath: "portfolio",
      contextDataPath: "portfolio",
      tplFile: "FormStep",
      order: 3,
      attrs: {
        title: "Certyfikaty i uprawnienia",
        description: "Wprowadź informacje o posiadanych certyfikatach i uprawnieniach",
        jsonSchema: {
          type: "object",
          properties: {
            certificateNumber: { 
              type: "string", 
              title: "Numer certyfikatu/uprawnień"
            },
            certificateExpiry: { 
              type: "string", 
              title: "Data ważności",
              format: "date"
            }
          }
        },
        submitLabel: "Dalej",
      },
    },
    {
      slug: "portfolio-images",
      label: "Krok 4: Galeria realizacji",
      contextSchemaPath: "portfolio",
      contextDataPath: "portfolio",
      tplFile: "WidgetsStep",
      order: 4,
      attrs: {
        widgets: [
          {
            tplFile: "TitleWidget",
            title: "Galeria realizacji",
            subtitle: "Dodaj zdjęcia swoich realizacji, które pokazują jakość Twojej pracy",
            colSpan: "full",
          },
          {
            tplFile: "ImageUploaderWidget",
            title: "Dodaj zdjęcia",
            contextDataPath: "portfolio.images",
            colSpan: "full",
          }
        ],
      },
    },
    {
      slug: "portfolio-summary",
      label: "Krok 5: Podsumowanie",
      contextSchemaPath: "portfolio",
      contextDataPath: "portfolio",
      tplFile: "WidgetsStep",
      order: 5,
      saveToDB: {
        enabled: true,
        provider: "indexedDB",
        itemType: "portfolio",
        itemTitle: "Profil firmy",
        contentPath: "portfolio"
      },
      attrs: {
        widgets: [
          {
            tplFile: "TitleWidget",
            title: "Podsumowanie profilu",
            subtitle: "Twój profil jest już widoczny dla beneficjentów po wykupieniu punktów",
            colSpan: "full",
          },
          {
            tplFile: "PortfolioPreviewWidget",
            contextDataPath: "portfolio",
            colSpan: "full",
          },
          {
            tplFile: "InfoWidget",
            title: "Status",
            data: "Twój profil został zapisany i będzie widoczny dla beneficjentów po weryfikacji przez operatora.",
            icon: "info",
            colSpan: "full",
          }
        ],
      },
    },
  ],
};