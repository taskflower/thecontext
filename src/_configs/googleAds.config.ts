// src/config/googleAds.config.ts
import { AppConfig } from "../core/types";

const config: AppConfig = {
  name: "Google Ads Kampanie",
  description: "Tworzenie i zarządzanie kampaniami Google Ads",
  tplDir: "clean",
  workspaces: [
    {
      slug: "workspace-google-ads",
      name: "Google Ads Management",
      description: "Tworzenie i zarządzanie kampaniami reklamowymi",
      icon: "megaphone",
      templateSettings: {
        layoutFile: "Simple",
        widgets: [
          {
            tplFile: "ScenarioListWidget",
            title: "Dostępne scenariusze",
            colSpan: "full",
          },
        ],
      },
      contextSchema: {
        type: "object",
        properties: {
          "campaign-basic": {
            type: "object",
            properties: {
              campaignName: {
                type: "string",
                title: "Nazwa kampanii",
                description: "Wprowadź nazwę dla Twojej kampanii",
              },
              campaignBudget: {
                type: "number",
                title: "Budżet dzienny (PLN)",
                description: "Określ dzienny budżet kampanii w PLN",
              },
              campaignStatus: {
                type: "string",
                title: "Status kampanii",
                description: "Wybierz początkowy status kampanii",
                enum: ["PAUSED", "ENABLED"],
                enumNames: ["Wstrzymana", "Aktywna"],
              },
              campaignStartDate: {
                type: "string",
                format: "date",
                title: "Data rozpoczęcia",
                description: "Od kiedy kampania ma być aktywna",
              },
              campaignEndDate: {
                type: "string",
                format: "date",
                title: "Data zakończenia (opcjonalnie)",
                description: "Do kiedy kampania ma być aktywna (pozostaw puste dla kampanii bezterminowej)",
              },
              advertisingChannel: {
                type: "string",
                title: "Kanał reklamowy",
                description: "Wybierz typ kampanii",
                enum: ["SEARCH", "DISPLAY", "VIDEO"],
                enumNames: ["Wyszukiwarka", "Sieć reklamowa", "Wideo"],
              }
            },
            required: ["campaignName", "campaignBudget", "campaignStatus", "campaignStartDate", "advertisingChannel"],
          },
          "ad-group": {
            type: "object",
            properties: {
              adGroupName: {
                type: "string",
                title: "Nazwa grupy reklam",
                description: "Wprowadź nazwę dla grupy reklam",
              },
              adGroupStatus: {
                type: "string",
                title: "Status grupy reklam",
                description: "Wybierz status grupy reklam",
                enum: ["PAUSED", "ENABLED"],
                enumNames: ["Wstrzymana", "Aktywna"],
              },
              adGroupType: {
                type: "string",
                title: "Typ grupy reklam",
                description: "Wybierz typ grupy reklam",
                enum: ["SEARCH_STANDARD", "DISPLAY_STANDARD"],
                enumNames: ["Standardowa (wyszukiwarka)", "Standardowa (sieć reklamowa)"],
              }
            },
            required: ["adGroupName", "adGroupStatus", "adGroupType"],
          },
          "ad-content": {
            type: "object",
            properties: {
              headlinePart1: {
                type: "string",
                title: "Nagłówek 1",
                description: "Główny nagłówek reklamy (maks. 30 znaków)",
                maxLength: 30,
              },
              headlinePart2: {
                type: "string",
                title: "Nagłówek 2",
                description: "Dodatkowy nagłówek reklamy (maks. 30 znaków)",
                maxLength: 30,
              },
              description: {
                type: "string",
                title: "Opis",
                description: "Treść reklamy (maks. 90 znaków)",
                maxLength: 90,
                format: "textarea",
              },
              finalUrl: {
                type: "string",
                title: "URL docelowy",
                description: "Strona docelowa po kliknięciu w reklamę",
                format: "url",
              }
            },
            required: ["headlinePart1", "headlinePart2", "description", "finalUrl"],
          },
          "keywords": {
            type: "object",
            properties: {
              keywords: {
                type: "string",
                title: "Słowa kluczowe",
                description: "Wpisz słowa kluczowe, każde w nowej linii. Użyj prefiksów: dla dokładnego dopasowania [słowo kluczowe], dla dopasowania wyrażenia \"słowo kluczowe\" lub + dla dopasowania z modyfikacją.",
                format: "textarea",
              }
            },
            required: ["keywords"],
          },
          "campaign-review": {
            type: "object",
            properties: {
              reviewNotes: {
                type: "string",
                title: "Uwagi",
                description: "Dodatkowe uwagi do kampanii",
                format: "textarea",
              }
            },
          },
          "campaign-creation-result": {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                description: "Czy kampania została utworzona pomyślnie",
              },
              campaignId: {
                type: "string",
                description: "Identyfikator utworzonej kampanii",
              },
              adGroupId: {
                type: "string",
                description: "Identyfikator utworzonej grupy reklam",
              },
              adId: {
                type: "string",
                description: "Identyfikator utworzonej reklamy",
              },
              errorMessage: {
                type: "string",
                description: "Komunikat błędu, jeśli kampania nie została utworzona",
              }
            },
          },
        },
      }
    },
  ],
  scenarios: [
    {
      slug: "monitor-campaigns",
      workspaceSlug: "workspace-google-ads",
      name: "Monitor kampanii",
      description: "Monitorowanie i zarządzanie wszystkimi kampaniami Google Ads",
      icon: "bar-chart-2",
      nodes: [
        {
          slug: "campaigns-dashboard",
          label: "Dashboard kampanii",
          contextSchemaPath: "campaign-dashboard",
          contextDataPath: "campaign-dashboard",
          tplFile: "GoogleAdsCampaignMonitor",
          order: 0,
          attrs: {
            title: "Monitor kampanii Google Ads",
            description: "Zarządzaj i monitoruj wszystkie kampanie reklamowe",
          },
        },
        {
          slug: "campaign-details",
          label: "Szczegóły kampanii",
          contextSchemaPath: "campaign-dashboard",
          contextDataPath: "campaign-dashboard",
          tplFile: "GoogleAdsDashboard",
          order: 1,
          attrs: {
            title: "Szczegóły kampanii",
            description: "Szczegółowe informacje o wybranej kampanii",
            enableEdit: true,
          },
        }
      ],
    },
    {
      slug: "create-search-campaign",
      workspaceSlug: "workspace-google-ads",
      name: "Utwórz kampanię w wyszukiwarce",
      description: "Kreator kampanii reklamowej w wyszukiwarce Google",
      icon: "search",
      nodes: [
        {
          slug: "campaign-settings",
          label: "Krok 1: Ustawienia kampanii",
          contextSchemaPath: "campaign-basic",
          contextDataPath: "campaign-basic",
          tplFile: "FormStep",
          order: 0,
          attrs: {
            title: "Ustawienia kampanii",
            description: "Wprowadź podstawowe informacje o kampanii reklamowej",
            submitLabel: "Dalej",
            showRequiredHint: true,
          },
        },
        {
          slug: "ad-group-settings",
          label: "Krok 2: Grupa reklam",
          contextSchemaPath: "ad-group",
          contextDataPath: "ad-group",
          tplFile: "FormStep",
          order: 1,
          attrs: {
            title: "Ustawienia grupy reklam",
            description: "Skonfiguruj grupę reklam dla Twojej kampanii",
            submitLabel: "Dalej",
            showRequiredHint: true,
          },
        },
        {
          slug: "ad-content",
          label: "Krok 3: Treść reklamy",
          contextSchemaPath: "ad-content",
          contextDataPath: "ad-content",
          tplFile: "FormStep",
          order: 2,
          attrs: {
            title: "Treść reklamy",
            description: "Stwórz treść swojej reklamy tekstowej",
            submitLabel: "Dalej",
            showRequiredHint: true,
          },
        },
        {
          slug: "keywords",
          label: "Krok 4: Słowa kluczowe",
          contextSchemaPath: "keywords",
          contextDataPath: "keywords",
          tplFile: "FormStep",
          order: 3,
          attrs: {
            title: "Słowa kluczowe",
            description: "Określ słowa kluczowe, dla których ma być wyświetlana Twoja reklama",
            submitLabel: "Dalej",
            showRequiredHint: true,
          },
        },
        {
          slug: "campaign-review",
          label: "Krok 5: Podsumowanie",
          contextSchemaPath: "campaign-review",
          contextDataPath: "campaign-review",
          tplFile: "WidgetsStep",
          order: 4,
          attrs: {
            title: "Podsumowanie kampanii",
            subtitle: "Sprawdź ustawienia przed utworzeniem kampanii",
            widgets: [
              {
                tplFile: "ListObjectWidget",
                title: "Podstawowe informacje",
                contextDataPath: "campaign-basic",
                layout: "list",
                colSpan: 1,
              },
              {
                tplFile: "ListObjectWidget",
                title: "Grupa reklam",
                contextDataPath: "ad-group",
                layout: "list",
                colSpan: 1,
              },
              {
                tplFile: "InfoWidget",
                title: "Treść reklamy",
                contextDataPath: "ad-content.headlinePart1",
                subtitle: "ad-content.headlinePart2",
                description: "ad-content.description",
                colSpan: 1,
              },
              {
                tplFile: "FormStep",
                schema: "campaign-review",
                data: "campaign-review",
                title: "Uwagi dodatkowe",
                description: "Możesz dodać uwagi do kampanii (opcjonalnie)",
                submitLabel: "Utwórz kampanię",
                showRequiredHint: false,
                colSpan: "full",
              }
            ],
          },
        },
        {
          slug: "create-campaign",
          label: "Krok 6: Tworzenie kampanii",
          contextSchemaPath: "campaign-creation-result",
          contextDataPath: "campaign-creation-result",
          tplFile: "GoogleAdsCampaignCreator", // Ten komponent musimy utworzyć
          order: 5,
          attrs: {
            title: "Tworzenie kampanii",
            description: "Trwa tworzenie kampanii w Google Ads...",
          },
        },
        {
          slug: "campaign-result",
          label: "Krok 7: Wynik",
          contextSchemaPath: "campaign-creation-result",
          contextDataPath: "campaign-creation-result",
          tplFile: "WidgetsStep",
          order: 6,
          attrs: {
            title: "Wynik tworzenia kampanii",
            subtitle: "Status utworzonej kampanii Google Ads",
            widgets: [
              {
                tplFile: "InfoWidget",
                title: "Status kampanii",
                contextDataPath: "campaign-creation-result.success",
                icon: "check",
                variant: "filled",
                colSpan: "full",
              },
              {
                tplFile: "ListObjectWidget",
                title: "Szczegóły kampanii",
                contextDataPath: "campaign-creation-result",
                layout: "list",
                colSpan: "full",
              }
            ],
          },
        },
      ],
    }
  ],
};

export default config;