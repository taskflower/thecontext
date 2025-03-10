// src/modules/scenarios_module/data/mockScenarioData.ts
import { Edge, Node } from "../scenarios_module/types";

// Initial nodes for the scenario store - marketing campaign generation
export const initialNodes: Record<string, Node> = {
  start: {
    id: "start",
    message: "Podaj adres strony WWW, dla której mam wygenerować kampanię marketingową",
    category: "default",
  },
  analyzeSite: {
    id: "analyzeSite",
    message: "Analiza strony WWW pod kątem branży, grupy docelowej i celu biznesowego",
    category: "flow",
  },
  generateKeywords: {
    id: "generateKeywords",
    message: "Wygeneruj listę 10-15 słów kluczowych związanych z tematyką strony",
    category: "flow",
  },
  generateCampaignDescription: {
    id: "generateCampaignDescription",
    message: "Napisz opis kampanii marketingowej (300-500 słów) zawierający propozycję strategii, kanałów promocji i głównych przekazów",
    category: "flow",
  },
  generateAdConcepts: {
    id: "generateAdConcepts",
    message: "Zaproponuj 3 koncepcje reklam do wykorzystania w kampanii wraz z tekstami",
    category: "flow",
  },
  summary: {
    id: "summary",
    message: "Podsumuj całą kampanię i podaj szacunkowy budżet oraz harmonogram działań",
    category: "default",
  }
};

// Initial edges for the scenario store
export const initialEdges: Edge[] = [
  { source: "start", target: "analyzeSite" },
  { source: "analyzeSite", target: "generateKeywords" },
  { source: "generateKeywords", target: "generateCampaignDescription" },
  { source: "generateCampaignDescription", target: "generateAdConcepts" },
  { source: "generateAdConcepts", target: "summary" }
];

// Initial categories for the scenario store
export const initialCategories: string[] = [
  "default",
  "flow",
  "template",
  "procesy",
  "marketing",
  "analiza"
];

// Initial node responses (empty by default)
export const initialNodeResponses: Record<string, string> = {};