// src/templates/default/data/formSchemas.ts

export function getFormSchemas() {
    return {
      websiteForm: [
        {
          name: "www",
          label: "Adres strony WWW",
          type: "text",
          required: true,
        },
      ],
      fbCampaignSettings: [
        {
          name: "cel",
          label: "Cel kampanii",
          type: "select",
          required: true,
          options: [
            "Świadomość marki",
            "Ruch na stronie",
            "Konwersje",
            "Instalacje aplikacji",
            "Pozyskiwanie leadów"
          ]
        },
        {
          name: "budżet",
          label: "Dzienny budżet (PLN)",
          type: "number",
          required: true
        },
        {
          name: "czas_trwania",
          label: "Czas trwania kampanii (dni)",
          type: "number",
          required: true
        }
      ],
      fbCampaignOptimizations: [
        {
          name: "zwiększBudżet",
          label: "Zwiększ dzienny budżet o 20%",
          type: "select",
          required: true,
          options: ["Tak", "Nie"]
        },
        {
          name: "rozszerzTargetowanie",
          label: "Rozszerz targetowanie o dodatkowe grupy demograficzne",
          type: "select",
          required: true,
          options: ["Tak", "Nie"]
        },
        {
          name: "zmieńCTA",
          label: "Zmodyfikuj przycisk CTA",
          type: "select",
          required: true,
          options: ["Tak", "Nie"]
        },
        {
          name: "optymalizacjaStawek",
          label: "Włącz automatyczną optymalizację stawek",
          type: "select",
          required: true,
          options: ["Tak", "Nie"]
        }
      ]
    };
  }