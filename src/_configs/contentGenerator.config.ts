// src/config/contentGenerator.config.ts
import { AppConfig } from "../core/types";

const config: AppConfig = {
  name: "Content Generator",
  description: "Generator treści i artykułów",
  tplDir: "default",

  workspaces: [
    {
      slug: "workspace-content",
      name: "Generator Artykułów",
      description: "Tworzenie artykułów blogowych z wykorzystaniem AI",
      icon: "file-text",
      contextSchema: {
        type: "object",
        properties: {
          article: {
            type: "object",
            properties: {
              topic: { type: "string", title: "Temat artykułu" },
              audience: { type: "string", title: "Grupa docelowa" },
              tone: { type: "string", title: "Ton artykułu" },
              outline: {
                type: "object",
                properties: {
                  title: { type: "string", title: "Proponowany tytuł" },
                  sections: {
                    type: "array",
                    items: { type: "string" },
                    title: "Lista sekcji",
                  },
                },
              },
              content: {
                type: "object",
                properties: {
                  title: { type: "string", title: "Tytuł artykułu" },
                  intro: { type: "string", title: "Wstęp artykułu" },
                  body: { type: "string", title: "Rozwinięcie artykułu" },
                  conclusion: {
                    type: "string",
                    title: "Podsumowanie artykułu",
                  },
                  cta: { type: "string", title: "Call to Action" },
                },
              },
            },
          },
        },
      },
    },
  ],
  scenarios: [
    {
      workspaceSlug: "workspace-content",
      slug: "scenario-article",
      name: "Artykuł na blog",
      description: "Stwórz kompletny artykuł blogowy",
      icon: "pencil",
      systemMessage:
        "Jesteś specjalistą od content marketingu z wieloletnim doświadczeniem w tworzeniu treści.",
      nodes: [
        {
          slug: "article-topic",
          label: "Krok 1: Temat artykułu",
          contextSchemaPath: "article",
          contextDataPath: "article",
          tplFile: "FormStep",
          order: 0,
          attrs: {
            title: "Podaj temat, grupę docelową i ton",
            description: "",
            submitLabel: "Dalej",
          },
        },
        {
          slug: "generate-outline",
          label: "Krok 2: Plan artykułu",
          contextSchemaPath: "article.outline",
          contextDataPath: "article.outline",
          tplFile: "LlmStep",
          order: 1,
          attrs: {
            autoStart: true,
            showResults: true,
            systemMessage:
              "Na podstawie tematu i grupy docelowej wygeneruj plan artykułu w JSON.",
            userMessage:
              "Przygotuj plan artykułu: temat={{article.topic}}, grupa={{article.audience}}",
          },
        },
        {
          slug: "generate-article",
          label: "Krok 3: Treść artykułu",
          contextSchemaPath: "article.content",
          contextDataPath: "article.content",
          tplFile: "LlmStep",
          order: 2,
          attrs: {
            autoStart: true,
            showResults: true,
            systemMessage: "Na podstawie planu napisz pełny artykuł w JSON.",
            userMessage:
              "Napisz pełny artykuł: temat={{article.topic}}, grupa={{article.audience}}, plan={{article.outline.sections}}",
          },
        },
      ],
    },
  ],
};

export default config;
