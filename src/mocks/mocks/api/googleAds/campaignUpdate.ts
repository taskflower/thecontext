// src/mocks/api/googleAds/campaignUpdate.ts
export const mockCampaignUpdate = (campaignId: string, updateData: any) => {
    return {
      success: true,
      data: {
        id: campaignId,
        name: updateData.name || `Kampania ${campaignId.slice(-4)}`,
        status: updateData.status || "ENABLED",
        updatedAt: new Date().toISOString(),
        message: "Kampania została zaktualizowana pomyślnie"
      }
    };
  };
  
  // Symulacja błędu aktualizacji - przekroczenie budżetu
  export const mockCampaignUpdateBudgetError = () => {
    return {
      success: false,
      error: {
        code: "BUDGET_LIMIT_EXCEEDED",
        message: "Podany budżet przekracza maksymalny dozwolony limit dla konta"
      }
    };
  };
  
  // Symulacja błędu aktualizacji - ogólny błąd
  export const mockCampaignUpdateError = () => {
    return {
      success: false,
      error: {
        code: "UPDATE_FAILED",
        message: "Nie udało się zaktualizować kampanii. Sprawdź poprawność danych i spróbuj ponownie."
      }
    };
  };