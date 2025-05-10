// src/_configs/googleAdsApp/workspaces/googleads.workspace.ts
import { WorkspaceConfig } from "@/core";

export const googleAdsWorkspace: WorkspaceConfig = {
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
};