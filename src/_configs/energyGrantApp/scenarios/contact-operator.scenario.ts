// src/_configs/energyGrantApp/scenarios/contact-operator.scenario.ts
import { ScenarioConfig } from "../../../core/types";

export const contactOperatorScenario: ScenarioConfig = {
  slug: "scenario-contact-operator",
  workspaceSlug: "workspace-energygrant",
  name: "Kontakt z Operatorem",
  description: "Kalkulator zdolności, formularz zgłoszeniowy i chat z operatorem",
  icon: "mail",
  // Dostępność dla ról
  roleAccess: ["beneficjent"],
  nodes: [
    {
      slug: "grant-calculator",
      label: "Krok 1: Kalkulator zdolności do dotacji",
      contextSchemaPath: "grant-calculator",
      contextDataPath: "grant-calculator",
      tplFile: "FormStep",
      order: 0,
      attrs: {
        title: "Kalkulator zdolności do dotacji",
        description: "Sprawdź swoją kwalifikację do programu dotacji energetycznych",
        jsonSchema: {
          type: "object",
          properties: {
            householdSize: { 
              type: "number", 
              title: "Liczba osób w gospodarstwie",
              minimum: 1,
              maximum: 10
            },
            income: { 
              type: "number", 
              title: "Miesięczny dochód na osobę (PLN)",
              minimum: 0
            },
            coOwners: { 
              type: "boolean", 
              title: "Czy są współwłaściciele nieruchomości?"
            }
          },
          required: ["householdSize", "income", "coOwners"]
        },
        submitLabel: "Oblicz",
      },
    },
    {
      slug: "calculator-results",
      label: "Wyniki kalkulatora",
      contextSchemaPath: "grant-calculator",
      contextDataPath: "grant-calculator",
      tplFile: "LlmStep",
      order: 1,
      attrs: {
        title: "Wyniki kalkulacji zdolności do dotacji",
        autoStart: true,
        userMessage:
          "Na podstawie danych: liczba osób w gospodarstwie: {{grant-calculator.householdSize}}, miesięczny dochód na osobę: {{grant-calculator.income}} PLN, czy są współwłaściciele: {{grant-calculator.coOwners}}. " +
          "Określ kwalifikację do dotacji energetycznej i potencjalną wysokość dotacji. " +
          "Zasady: Gospodarstwo kwalifikuje się gdy dochód na osobę < 1500 PLN przy min. 2 osobach lub < 2100 PLN przy 1 osobie. " +
          "Podstawowa wysokość dotacji to 30000 PLN, ale przy współwłaścicielach trzeba dzielić tę kwotę. " +
          "Zwróć JSON z polami: grantEligibility (boolean) i grantAmount (number).",
      },
    },
    {
      slug: "calculator-summary",
      label: "Podsumowanie kalkulacji",
      contextSchemaPath: "grant-calculator",
      contextDataPath: "grant-calculator",
      tplFile: "WidgetsStep",
      order: 2,
      attrs: {
        widgets: [
          {
            tplFile: "TitleWidget",
            title: "Wynik kalkulacji dotacji",
            colSpan: "full",
          },
          {
            tplFile: "EligibilityWidget",
            contextDataPath: "grant-calculator",
            colSpan: "full",
          }
        ],
      },
    },
    {
      slug: "contact-form",
      label: "Krok 2: Formularz kontaktowy",
      contextSchemaPath: "contact-form",
      contextDataPath: "contact-form",
      tplFile: "FormStep",
      order: 3,
      attrs: {
        title: "Formularz kontaktowy do Operatora",
        description: "Wypełnij formularz, aby skontaktować się z Operatorem programu",
        jsonSchema: {
          type: "object",
          properties: {
            name: { 
              type: "string", 
              title: "Imię i nazwisko"
            },
            email: { 
              type: "string", 
              title: "Adres e-mail",
              format: "email"
            },
            phone: { 
              type: "string", 
              title: "Numer telefonu"
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
            message: { 
              type: "string", 
              title: "Treść wiadomości"
            }
          },
          required: ["name", "email", "phone", "postalCode", "city", "message"]
        },
        submitLabel: "Wyślij wiadomość",
      },
    },
    {
      slug: "contact-confirmation",
      label: "Potwierdzenie wysłania",
      contextSchemaPath: "contact-form",
      contextDataPath: "contact-form",
      tplFile: "WidgetsStep",
      order: 4,
      attrs: {
        widgets: [
          {
            tplFile: "TitleWidget",
            title: "Wiadomość została wysłana",
            subtitle: "Dziękujemy za kontakt. Operator skontaktuje się z Tobą w najbliższym czasie.",
            colSpan: "full",
          },
          {
            tplFile: "InfoWidget",
            title: "Twoje dane kontaktowe",
            contextDataPath: "contact-form.email",
            icon: "mail",
            colSpan: 1,
          },
          {
            tplFile: "InfoWidget",
            title: "Numer telefonu",
            contextDataPath: "contact-form.phone",
            icon: "info",
            colSpan: 1,
          },
          {
            tplFile: "ChatWidget",
            title: "Chat z operatorem",
            colSpan: "full",
          }
        ],
      },
    },
  ],
};