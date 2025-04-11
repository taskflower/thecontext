// src/templates/default/index.ts
import { lazy } from "react";
import {
  BaseTemplate,
  BaseTemplateConfig,
  BaseWorkspaceData,
  Scenario,
} from "../baseTemplate"; // Upewnij się, że ścieżka jest poprawna
import { WidgetCategory } from "@/lib/templates"; // Upewnij się, że ścieżka jest poprawna


export class DefaultTemplate extends BaseTemplate {
  readonly id = "default";
  readonly name = "Default Template";
  readonly description = "The standard template with a clean, modern design";
  readonly version = "1.0.0";
  readonly author = "Application Team";

  getConfig(): BaseTemplateConfig {
    // Layouts
    const layouts = [
      {
        id: "default",
        name: "Default Layout",
        component: lazy(() => import("./layouts/DefaultLayout")),
      },
      {
        id: "sidebar",
        name: "Sidebar Layout",
        component: lazy(() => import("./layouts/SidebarLayout")),
      },
    ];

    // Widgets
    const widgets = [
      {
        id: "card-list",
        name: "Card List",
        category: "scenario" as WidgetCategory,
        component: lazy(() => import("./widgets/CardListWidget")),
      },
      {
        id: "table-list",
        name: "Table List",
        category: "scenario" as WidgetCategory,
        component: lazy(() => import("./widgets/TableListWidget")),
      },
    ];

    // Flow steps
    const flowSteps = [
      {
        id: "basic-step",
        name: "Basic Step",
        compatibleNodeTypes: ["default", "input", "output"], // Dodano 'output' dla kompatybilności
        component: lazy(() => import("./flowSteps/BasicStepTemplate")),
      },
      {
        id: "llm-query",
        name: "LLM Query",
        compatibleNodeTypes: ["llm"],
        component: lazy(() => import("./flowSteps/LlmQueryTemplate")),
      },
      {
        id: "form-step",
        name: "Form Input",
        compatibleNodeTypes: ["form"],
        component: lazy(() => import("./flowSteps/FormInputTemplate")),
      },
      // --- NOWY KROK PRZEPŁYWU ---
      {
        id: "api-call-step",
        name: "API Call",
        compatibleNodeTypes: ["api"], // Definiujemy nowy typ węzła 'api'
        component: lazy(() => import("./flowSteps/ApiCallTemplate")), // Wskazujemy na nowy komponent
      },
      // --- KONIEC NOWEGO KROKU ---
    ];

    return {
      id: this.id,
      name: this.name,
      description: this.description,
      version: this.version,
      author: this.author,
      layouts,
      widgets,
      flowSteps,
    };
  }

  getDefaultWorkspaceData(): BaseWorkspaceData {
    // --- ISTNIEJĄCY SCENARIUSZ ---
    const marketingScenario: Scenario = {
      id: "scenario-1",
      name: "Analiza Marketingowa WWW",
      description: "Analiza strony internetowej pod kątem marketingowym",
      nodes: [
        {
          id: "form-node-1",
          scenarioId: "scenario-1",
          label: "Adres WWW",
          assistantMessage:
            "Witaj! Podaj adres strony internetowej do analizy marketingowej:",
          contextPath: "userProfile",
          templateId: "form-step",
          nodeType: "form", // Dodano nodeType dla jasności
          attrs: {
            formSchemaPath: "formSchemas.websiteForm",
          },
        },
        {
          id: "ai-analysis-node",
          scenarioId: "scenario-1",
          label: "Analiza AI",
          // assistantMessage:
          //   "Dziękuję! Przeanalizuję stronę {{userProfile.www}}, dostarczajac odpowiednio sformatowaną odpowiedź.",
          contextPath: "analysisResult", // Zmieniono contextPath, aby przechowywać wynik analizy oddzielnie
          templateId: "llm-query",
          nodeType: "llm", // Dodano nodeType
          attrs: {
            llmSchemaPath: "llmSchemas.webAnalysing",
            includeSystemMessage: true,
            initialUserMessage: "Przeanalizuj adres www {{userProfile.www}}. Odpowiedź wyslij jako obiekt JSON zgodnie ze schematem:",
          },
        },
         { // Dodatkowy krok wyświetlający wynik analizy przed przejściem dalej
          id: "show-analysis-result",
          scenarioId: "scenario-1",
          label: "Wynik Analizy",
          assistantMessage: "Oto wyniki analizy strony {{userProfile.www}}:",
          contextPath: "analysisResult", // Wskazuje na wynik analizy
          templateId: "basic-step", // Używamy prostego kroku do wyświetlenia (można by stworzyć dedykowany)
          nodeType: "output",
          attrs: {
             // Można dodać atrybuty formatujące, jeśli BasicStepTemplate je obsługuje
             displayDataPath: "analysisResult" // Wskazujemy co ma być wyświetlone
          },
        },
      ],
      systemMessage:
        "Jesteś w roli twórcy strategii marketingowej. Używamy języka polskiego.",
    };
    // --- KONIEC ISTNIEJĄCEGO SCENARIUSZA ---

    // --- NOWY SCENARIUSZ: KAMPANIA FACEBOOK ---
    const facebookCampaignScenario: Scenario = {
      id: "scenario-2",
      name: "Kampania Facebook Ads",
      description: "Tworzenie kampanii reklamowej na Facebooku na podstawie analizy WWW",
      nodes: [
         // Zakładamy, że ten scenariusz jest uruchamiany PO analizie WWW
         // Można by dodać krok startowy informujący o tym.
         // Lub połączyć scenariusze (bardziej zaawansowane)
        {
          id: "fb-intro-node",
          scenarioId: "scenario-2",
          label: "Wprowadzenie do Kampanii FB",
          assistantMessage: "Na podstawie analizy strony {{userProfile.www}} ({{analysisResult.ogólny_opis}}), przygotujmy kampanię na Facebooku. Podaj szczegóły:",
          contextPath: null, // Ten krok nie zapisuje niczego bezpośrednio
          templateId: "basic-step",
          nodeType: "output",
          attrs: {},
        },
        {
          id: "fb-form-node",
          scenarioId: "scenario-2",
          label: "Dane Kampanii FB",
          assistantMessage: "Uzupełnij dane kampanii:",
          contextPath: "facebookCampaignInput", // Nowa ścieżka w kontekście
          templateId: "form-step",
          nodeType: "form",
          attrs: {
            formSchemaPath: "formSchemas.facebookCampaignForm", // Nowy schemat formularza
          },
        },
        {
            id: "fb-llm-prepare",
            scenarioId: "scenario-2",
            label: "Przygotowanie Danych dla API",
            assistantMessage: "Analizuję dane i przygotowuję strukturę dla API Facebooka...",
            contextPath: "facebookApiPayload", // Wynik LLM - gotowy payload (lub jego część)
            templateId: "llm-query",
            nodeType: "llm",
            attrs: {
                llmSchemaPath: "llmSchemas.facebookApiPrep", // Opcjonalny schemat odpowiedzi LLM
                includeSystemMessage: false, // Można dostosować system message
                initialUserMessage: `Na podstawie analizy: {{analysisResult}} oraz danych kampanii: {{facebookCampaignInput}}, przygotuj propozycję tekstu reklamy i sugestie targetowania dla API Facebook Ads. Odpowiedź jako JSON z kluczami: "ad_text", "targeting_suggestions".`,
            }
        },
        {
          id: "fb-api-call-node",
          scenarioId: "scenario-2",
          label: "Tworzenie Kampanii (API Call)",
          assistantMessage: "Próbuję utworzyć kampanię za pomocą API Facebooka...",
          contextPath: "facebookCampaignResult", // Wynik wywołania API
          templateId: "api-call-step", // Używamy nowego kroku
          nodeType: "api",
          attrs: {
            // Tutaj przekazujemy konfigurację dla ApiCallTemplate
            apiUrl: "https://graph.facebook.com/vXX.X/act_AD_ACCOUNT_ID/campaigns", // Przykładowy URL - wymaga aktualizacji i dynamicznego ID konta
            method: "POST",
            payloadDataPath: "facebookApiPayload", // Skąd wziąć dane do wysłania (wynik kroku LLM lub formularza)
            headers: {
                // UWAGA: Autoryzacja to KLUCZOWY problem.
                // Nigdy nie umieszczaj tokenów na stałe w kodzie frontendu!
                // To powinno być obsługiwane bezpiecznie, np. przez backend proxy.
                // 'Authorization': 'Bearer USER_ACCESS_TOKEN' // PRZYKŁAD - NIEBEZPIECZNY
            },
            // Można dodać inne opcje, np. mapowanie odpowiedzi
            resultMapping: { // Jak zapisać wynik z API do kontekstu
                successPath: "id", // Jeśli API zwróci { id: "123" }, zapisz "123" w contextPath
                errorPath: "error.message" // Jeśli API zwróci błąd, zapisz treść błędu
            }
          },
        },
        {
          id: "fb-result-node",
          scenarioId: "scenario-2",
          label: "Wynik Tworzenia Kampanii",
          // Wiadomość może być dynamiczna w komponencie BasicStepTemplate
          assistantMessage: "Wynik operacji tworzenia kampanii:",
          contextPath: "facebookCampaignResult",
          templateId: "basic-step",
          nodeType: "output",
          attrs: {
            // Można dodać logikę warunkową wyświetlania w komponencie
            // np. na podstawie tego czy facebookCampaignResult zawiera ID czy błąd
            displayDataPath: "facebookCampaignResult"
          },
        },
      ],
      systemMessage: "Jesteś specjalistą od marketingu na Facebooku, pomagającym w tworzeniu kampanii.", // Inny system message dla tego scenariusza
    };
    // --- KONIEC NOWEGO SCENARIUSZA ---


    // Dane początkowe kontekstu
    const initialContext: Record<string, any> = {
      userProfile: {
        www: "",
      },
      analysisResult: {}, // Miejsce na wynik analizy AI
      conversationHistory: [], // Można nadal używać lub zastąpić bardziej strukturalnymi danymi
      // --- NOWE ELEMENTY KONTEKSTU ---
      facebookCampaignInput: { // Dane z formularza kampanii FB
        budzet: null,
        cel: "",
        grupa_docelowa_opis: "",
        // ... inne pola potrzebne dla kampanii
      },
      facebookApiPayload: { // Przygotowane dane dla API FB (przez LLM lub bezpośrednio)
         ad_text: "",
         targeting_suggestions: [],
         // ... struktura wymagana przez konkretny endpoint API FB
      },
      facebookCampaignResult: null, // Wynik wywołania API FB (np. ID kampanii lub błąd)
      // --- KONIEC NOWYCH ELEMENTÓW ---
      formSchemas: {
        websiteForm: [
          {
            name: "www",
            label: "Adres strony WWW",
            type: "text",
            required: true,
          },
        ],
        // --- NOWY SCHEMAT FORMULARZA ---
        facebookCampaignForm: [
          { name: "budzet", label: "Budżet dzienny (PLN)", type: "number", required: true },
          { name: "cel", label: "Cel kampanii", type: "select", required: true, options: ["Zasięg", "Ruch", "Konwersje", "Aktywność"] },
          { name: "grupa_docelowa_opis", label: "Opis grupy docelowej (sugestie z analizy: {{analysisResult.grupa_docelowa}})", type: "textarea", required: false },
          { name: "tekst_reklamy_sugestia", label: "Sugestia tekstu reklamy (z LLM: {{facebookApiPayload.ad_text}})", type: "textarea", required: false },
          // Dodaj więcej pól zgodnie z potrzebami API Facebooka
        ],
        // --- KONIEC NOWEGO SCHEMATU ---
      },
      llmSchemas: {
        webAnalysing: {
            ogólny_opis: "Główne funkcje i typ strony",
            branża:"Nazwa najbardziej pasujęcej branży",
            grupa_docelowa: "Do kogo skierowana jest strona",
            mocne_strony: ["lista kluczowych stron"],
            słabe_strony: ["lista słabych stron"],
            sugestie_marketingowe: "Jak poprawić konwersję",
        },
        // --- NOWY SCHEMAT LLM ---
        facebookApiPrep: { // Schemat odpowiedzi LLM przygotowującego dane dla API
            ad_text: "Propozycja tekstu reklamy głównej",
            targeting_suggestions: ["sugestia 1", "sugestia 2"]
            // ... inne pola które LLM ma przygotować
        }
        // --- KONIEC NOWEGO SCHEMATU ---
      },
    };

    // Zwrócenie danych workspace
    return {
      id: "workspace-1",
      name: "Analiza Marketingowa i Kampanie", // Zaktualizowana nazwa
      description: "Workspace do analizy marketingowej i tworzenia kampanii Facebook", // Zaktualizowany opis
      scenarios: [marketingScenario, facebookCampaignScenario], // Dodano nowy scenariusz do listy
      templateSettings: {
        layoutTemplate: "default",
        scenarioWidgetTemplate: "card-list",
        defaultFlowStepTemplate: "basic-step",
        theme: "light",
      },
      initialContext,
    };
  }
}