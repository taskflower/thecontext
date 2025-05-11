// src/_configs/energyGrantApp/workspaces/energygrant.workspace.ts
import { WorkspaceConfig } from "@/core";

export const energyGrantWorkspace: WorkspaceConfig = {
  slug: "workspace-energygrant",
  name: "Program Dotacji Energetycznych",
  description: "Platforma łącząca beneficjentów, wykonawców i audytorów w programie dotacji energetycznych",
  icon: "home",
  templateSettings: {
    layoutFile: "Dashboard",
    widgets: [
      {
        tplFile: "InfoWidget",
        title: "Witaj w Programie Dotacji Energetycznych",
        data: "Aplikacja pomaga łączyć beneficjentów, wykonawców i audytorów w programie dotacji energetycznych. Wybierz odpowiednią funkcję z menu, aby rozpocząć.",
        icon: "info",
        colSpan: "full",
      },
      {
        tplFile: "RoleInfoWidget",
        title: "Role w systemie",
        colSpan: "full",
      },
      {
        tplFile: "ScenarioListWidget",
        title: "Dostępne funkcje",
        colSpan: "full",
      },
    ],
  },
  contextSchema: {
    type: "object",
    properties: {
      "user-data": {
        type: "object",
        properties: { 
          role: { 
            type: "string", 
            title: "Rola użytkownika",
            enum: ["beneficjent", "wykonawca", "audytor", "operator"]
          },
          verified: { 
            type: "boolean", 
            title: "Weryfikacja konta" 
          }
        },
      },
      "grant-calculator": {
        type: "object",
        properties: {
          householdSize: { type: "number", title: "Liczba osób w gospodarstwie" },
          income: { type: "number", title: "Dochód na osobę" },
          coOwners: { type: "boolean", title: "Czy są współwłaściciele" },
          grantEligibility: { type: "boolean", title: "Kwalifikacja do dotacji" },
          grantAmount: { type: "number", title: "Potencjalna wysokość dotacji" }
        },
      },
      "contact-form": {
        type: "object",
        properties: {
          name: { type: "string", title: "Imię i nazwisko" },
          email: { type: "string", title: "Adres e-mail" },
          phone: { type: "string", title: "Numer telefonu" },
          postalCode: { type: "string", title: "Kod pocztowy" },
          city: { type: "string", title: "Miejscowość" },
          message: { type: "string", title: "Wiadomość" }
        },
      },
      "order-request": {
        type: "object",
        properties: {
          address: { type: "string", title: "Adres" },
          phone: { type: "string", title: "Telefon" },
          scope: { type: "string", title: "Zakres prac" },
          hasAudit: { type: "boolean", title: "Czy jest audyt" },
          auditFile: { type: "string", title: "Plik audytu" },
          postalCode: { type: "string", title: "Kod pocztowy" },
          city: { type: "string", title: "Miejscowość" },
          orderType: { type: "string", title: "Typ zlecenia", enum: ["contractor", "auditor"] }
        },
      },
      "market-listing": {
        type: "object",
        properties: {
          listings: { 
            type: "array", 
            items: { 
              type: "object",
              properties: {
                id: { type: "string" },
                postalCode: { type: "string" },
                city: { type: "string" },
                scope: { type: "string" },
                hasAudit: { type: "boolean" },
                isVerified: { type: "boolean" },
                views: { type: "number" },
                created: { type: "string" },
                type: { type: "string", enum: ["contractor", "auditor"] }
              }
            } 
          },
          purchasedPoints: { type: "number", title: "Wykupione punkty" },
          unlockedListings: { 
            type: "array", 
            items: { type: "string" } 
          }
        },
      },
      "beneficiary-orders": {
        type: "object",
        properties: {
          orders: { 
            type: "array", 
            items: { 
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string", enum: ["contractor", "auditor"] },
                status: { type: "string" },
                created: { type: "string" },
                scope: { type: "string" },
                offers: { 
                  type: "array", 
                  items: { 
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      providerId: { type: "string" },
                      providerName: { type: "string" },
                      price: { type: "number" },
                      description: { type: "string" },
                      isAccepted: { type: "boolean" }
                    }
                  } 
                }
              }
            } 
          }
        },
      },
      "portfolio": {
        type: "object",
        properties: {
          companyName: { type: "string", title: "Nazwa firmy" },
          nip: { type: "string", title: "NIP" },
          address: { type: "string", title: "Adres" },
          postalCode: { type: "string", title: "Kod pocztowy" },
          city: { type: "string", title: "Miejscowość" },
          phone: { type: "string", title: "Telefon" },
          email: { type: "string", title: "E-mail" },
          website: { type: "string", title: "Strona www" },
          description: { type: "string", title: "Opis działalności" },
          certificateNumber: { type: "string", title: "Numer certyfikatu" },
          certificateExpiry: { type: "string", title: "Data ważności certyfikatu" },
          images: { 
            type: "array", 
            items: { type: "string" }, 
            title: "Zdjęcia realizacji" 
          },
          services: { 
            type: "array", 
            items: { type: "string" }, 
            title: "Oferowane usługi" 
          },
          portfolioType: { type: "string", enum: ["contractor", "auditor"] }
        },
      },
      "points-purchase": {
        type: "object",
        properties: {
          pointsAmount: { type: "number", title: "Liczba punktów" },
          price: { type: "number", title: "Cena" }
        },
      }
    },
  },
};