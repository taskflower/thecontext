export const PROJECT = {
  name: "Kampania marketingowa",
  tabs: [
    {
      title: "Analiza strony www",
      type: "documentList",
      containerId: "1740106369684",  // ID istniejącego kontenera
      actions: [
        {
          label: "Podgląd dokumentu",
          actionType: "viewDocument",
          tag: "website_marketing_description",
        },
        {
          label: "Analizuj stronę",
          actionType: "runFlow",
          flowId: "1740104976857", // Template ID that matches the template in store
        },
      ],
    },
    {
      title: "Kampanie",
      type: "documentList",
      containerId: "marketing-campaigns-container",  // ID istniejącego kontenera
      actions: [
        {
          label: "Podgląd kampanii",
          actionType: "viewDocument",
          tag: "campaign_detail",
        },
        {
          label: "Utwórz kampanię",
          actionType: "runFlow",
          flowId: "task-create-campaign",
        },
      ],
    },
  ],
  kanban: {
    boardTemplateId: "marketing-board",
    tasks: []
  }
}