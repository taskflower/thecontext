// src/_configs/energyGrantApp/scenarios/contractor-market.scenario.ts
import { ScenarioConfig } from "../../../core/types";

export const contractorMarketScenario: ScenarioConfig = {
  slug: "scenario-contractor-market",
  workspaceSlug: "workspace-energygrant",
  name: "Giełda Wykonawców",
  description: "Przeglądaj zlecenia i wykupuj punkty dostępu do pełnych danych kontaktowych",
  icon: "building",
  // Dostępność dla ról
  roleAccess: ["wykonawca"],
  nodes: [
    {
      slug: "market-listings-contractors",
      label: "Krok 1: Lista dostępnych zleceń",
      contextSchemaPath: "market-listing",
      contextDataPath: "market-listing",
      tplFile: "LlmStep",
      order: 0,
      attrs: {
        title: "Dostępne zlecenia na giełdzie wykonawców",
        autoStart: true,
        userMessage:
          "Wygeneruj przykładową listę zleceń dla wykonawców. " +
          "Zwróć JSON z polem 'listings' zawierającym tablicę 6 obiektów, każdy z polami: " +
          "id (string), postalCode (kod w formacie XX-XXX), city (nazwa miasta), " +
          "scope (zakres prac, np. 'Termomodernizacja ścian', 'Wymiana okien', 'Instalacja fotowoltaiki'), " +
          "hasAudit (boolean), isVerified (boolean), views (number), " +
          "created (string w formacie daty), type (zawsze 'contractor'). " +
          "Dodaj również pola: purchasedPoints ustawione na 10 i unlockedListings jako pustą tablicę.",
      },
    },
    {
      slug: "market-browse",
      label: "Przeglądanie giełdy",
      contextSchemaPath: "market-listing",
      contextDataPath: "market-listing",
      tplFile: "WidgetsStep",
      order: 1,
      attrs: {
        widgets: [
          {
            tplFile: "TitleWidget",
            title: "Giełda zleceń dla wykonawców",
            subtitle: "Przeglądaj dostępne zlecenia i wykup punkty, aby uzyskać dostęp do danych kontaktowych",
            colSpan: "full",
          },
          {
            tplFile: "FiltersWidget",
            title: "Filtry wyszukiwania",
            colSpan: "full",
          },
          {
            tplFile: "ListingsWidget",
            title: "Dostępne zlecenia",
            contextDataPath: "market-listing.listings",
            listingType: "contractor",
            colSpan: "full",
          },
        ],
      },
    },
    {
      slug: "points-purchase",
      label: "Krok 2: Zakup punktów",
      contextSchemaPath: "points-purchase",
      contextDataPath: "points-purchase",
      tplFile: "FormStep",
      order: 2,
      attrs: {
        title: "Zakup punktów dostępu",
        description: "Wykup punkty, aby uzyskać dostęp do pełnych danych kontaktowych zleceniodawców",
        jsonSchema: {
          type: "object",
          properties: {
            pointsAmount: { 
              type: "number", 
              title: "Liczba punktów",
              minimum: 1,
              maximum: 100,
              default: 10
            }
          },
          required: ["pointsAmount"]
        },
        submitLabel: "Przejdź do płatności",
      },
    },
    {
      slug: "points-calculation",
      label: "Obliczenie ceny",
      contextSchemaPath: "points-purchase",
      contextDataPath: "points-purchase",
      tplFile: "LlmStep",
      order: 3,
      attrs: {
        autoStart: true,
        userMessage:
          "Oblicz cenę za zakup punktów: {{points-purchase.pointsAmount}}. " +
          "Cena to 10 PLN za punkt. " +
          "Zwróć JSON z polem price zawierającym obliczoną cenę.",
      },
    },
    {
      slug: "payment-summary",
      label: "Krok 3: Podsumowanie i płatność",
      contextSchemaPath: "points-purchase",
      contextDataPath: "points-purchase",
      tplFile: "WidgetsStep",
      order: 4,
      attrs: {
        widgets: [
          {
            tplFile: "TitleWidget",
            title: "Podsumowanie zakupu punktów",
            colSpan: "full",
          },
          {
            tplFile: "InfoWidget",
            title: "Liczba punktów",
            contextDataPath: "points-purchase.pointsAmount",
            icon: "tag",
            colSpan: 1,
          },
          {
            tplFile: "InfoWidget",
            title: "Do zapłaty",
            contextDataPath: "points-purchase.price",
            icon: "credit-card",
            colSpan: 1,
          },
          {
            tplFile: "PaymentWidget",
            title: "Metody płatności",
            colSpan: "full",
          }
        ],
      },
    },
    {
      slug: "payment-confirmation",
      label: "Potwierdzenie płatności",
      contextSchemaPath: "points-purchase",
      contextDataPath: "points-purchase",
      tplFile: "WidgetsStep",
      order: 5,
      attrs: {
        widgets: [
          {
            tplFile: "TitleWidget",
            title: "Płatność zrealizowana",
            subtitle: "Punkty zostały dodane do Twojego konta. Możesz teraz odkrywać dane kontaktowe zleceniodawców.",
            colSpan: "full",
          },
          {
            tplFile: "InfoWidget",
            title: "Zakupione punkty",
            contextDataPath: "points-purchase.pointsAmount",
            icon: "check",
            colSpan: "full",
          },
          {
            tplFile: "ListingsWidget",
            title: "Wróć do zleceń",
            contextDataPath: "market-listing.listings",
            listingType: "contractor",
            colSpan: "full",
          },
        ],
      },
    },
  ],
};