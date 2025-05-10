// src/_configs/googleAdsApp/scenarios/create-search-campaign.scenario.ts
import { ScenarioConfig } from "../../../core/types";

export const createSearchCampaignScenario: ScenarioConfig = {
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
      saveToDB: {
        enabled: true,
        provider: "indexedDB",
        itemType: "project",
        itemTitle: "Kampania Google Ads - {{campaign-basic.campaignName}}",
        contentPath: ""
      },
    },
  ],
};