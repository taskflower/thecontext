// src/templates/default/workspaces/marketing/context.ts
export const initialContext = {
    web: {
      url: "https://example.com",
      analysis: {
        general_description: "",
        industry: "",
        target_audience: "",
        strengths: [],
        weaknesses: [],
        marketing_suggestions: ""
      }
    },
    campaign: {
      goal: "Świadomość marki",
      budget: 100,
      duration: 7,
      content: {},
      api: {},
      stats: {
        timeframe: "week",
      },
      optimizations: {
        increaseBudget: "Nie",
        expandTargeting: "Nie",
        changeCta: "Nie",
        autoBidding: "Nie"
      },
      summary: {}
    },
    schemas: {} // Będzie uzupełnione schematami
  };