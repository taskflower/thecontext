// src/_configs/marketingApp/workspaces/marketing.workspace.ts

import { WorkspaceConfig } from "@/core";


export const marketingWorkspace: WorkspaceConfig = {
  slug: "workspace-marketing",
  name: "Analiza Marketingowa",
  description: "Analiza strony internetowej i generowanie opisu marketingowego",
  icon: "globe",
  templateSettings: {
    layoutFile: "Simple",
    widgets: [
      {
        tplFile: "InfoWidget",
        title: "Jak to działa?",
        data: "Narzędzie analizuje podaną stronę internetową i przygotowuje szczegółowy opis marketingowy, który może być wykorzystany w przyszłych kampaniach.",
        icon: "info",
        colSpan: "full",
      },
      {
        tplFile: "ListObjectWidget",
        title: "Ostatnia analiza",
        contextDataPath: "website-data",
        layout: "table",
        colSpan: "full",
      },
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
      "website-data": {
        type: "object",
        properties: { url: { type: "string", title: "Adres URL strony" } },
      },
      "website-summary": {
        type: "object",
        properties: {
          summary: { type: "string", title: "Streszczenie strony" },
          keywords: {
            type: "array",
            items: { type: "string" },
            title: "Słowa kluczowe",
          },
          mainTopics: {
            type: "array",
            items: { type: "string" },
            title: "Główne tematy",
          },
        },
      },
      "marketing-description": {
        type: "object",
        properties: {
          marketingDescription: {
            type: "string",
            title: "Opis marketingowy",
          },
          industry: { type: "string", title: "Branża" },
          targetAudience: { type: "string", title: "Grupa docelowa" },
          suggestedChannels: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                description: { type: "string" },
                icon: { type: "string" },
              },
            },
            title: "Sugerowane kanały",
          },
          metrics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                value: { type: "number" },
                prefix: { type: "string" },
                suffix: { type: "string" },
                change: { type: "number" },
              },
            },
            title: "Metryki marketingowe",
          },
        },
      },
      "campaign-data": {
        type: "object",
        properties: {
          adGroups: { 
            type: "array", 
            items: { 
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                description: { type: "string" },
                icon: { type: "string" }
              }
            } 
          },
          keywords: { type: "array", items: { type: "string" } },
          budget: { type: "number", title: "Budżet" },
          roi: {
            type: "object",
            properties: {
              roi: { type: "number" },
              profits: { type: "number" },
              investment: { type: "number" }
            }
          }
        },
      },
    },
  },
};