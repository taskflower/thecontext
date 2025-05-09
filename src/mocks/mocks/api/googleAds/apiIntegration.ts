// src/mocks/api/googleAds/apiIntegration.ts
import { mockCampaignDetails, mockCampaignDetailsError } from './campaignDetails';
import { mockCampaignsList, mockEmptyCampaignsList, mockCampaignsListError } from './campaignsList';
import { mockCampaignUpdate, mockCampaignUpdateError } from './campaignUpdate';

/**
 * Klasa do integracji z zamockowanym API Google Ads
 */
export class GoogleAdsApiMock {
  // Szansa na wystąpienie błędu w zapytaniach (symulacja problemów z API)
  private errorChance = 0.05;
  
  /**
   * Symuluje pobieranie danych kampanii
   * @param campaignId - ID kampanii
   */
  async getCampaignDetails(campaignId: string): Promise<any> {
    // Symulujemy opóźnienie sieciowe
    await this.delay(500, 1500);
    
    // Symulujemy błąd z określonym prawdopodobieństwem
    if (Math.random() < this.errorChance) {
      return mockCampaignDetailsError();
    }
    
    return mockCampaignDetails(campaignId);
  }
  
  /**
   * Symuluje pobieranie listy kampanii
   */
  async getCampaignsList(): Promise<any> {
    // Symulujemy opóźnienie sieciowe
    await this.delay(700, 2000);
    
    // Symulujemy błąd z określonym prawdopodobieństwem
    if (Math.random() < this.errorChance) {
      return mockCampaignsListError();
    }
    
    // Opcjonalnie można wygenerować pustą listę kampanii
    if (Math.random() < 0.1) {
      return mockEmptyCampaignsList();
    }
    
    return mockCampaignsList();
  }
  
  /**
   * Symuluje aktualizację kampanii
   * @param campaignId - ID kampanii do aktualizacji
   * @param updateData - dane do aktualizacji
   */
  async updateCampaign(campaignId: string, updateData: any): Promise<any> {
    // Symulujemy opóźnienie sieciowe
    await this.delay(600, 1800);
    
    // Symulujemy błąd z określonym prawdopodobieństwem
    if (Math.random() < this.errorChance) {
      return mockCampaignUpdateError();
    }
    
    return mockCampaignUpdate(campaignId, updateData);
  }
  
  /**
   * Symuluje tworzenie nowej kampanii
   * @param campaignData - dane kampanii
   */
  async createCampaign(campaignData: any): Promise<any> {
    // Symulujemy opóźnienie sieciowe
    await this.delay(1000, 2500);
    
    // Symulujemy błąd z określonym prawdopodobieństwem
    if (Math.random() < this.errorChance) {
      return {
        success: false,
        error: {
          code: "CREATION_FAILED",
          message: "Nie udało się utworzyć kampanii. Sprawdź poprawność danych i spróbuj ponownie."
        }
      };
    }
    
    // Generujemy losowe ID dla nowej kampanii
    const campaignId = `new-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    return {
      success: true,
      data: {
        campaign: `/customers/123456789/campaigns/${campaignId}`,
        adGroup: `/customers/123456789/adGroups/${campaignId}-group-1`,
        ad: `/customers/123456789/ads/${campaignId}-ad-1`,
        keywords: campaignData.keywords?.split('\n').length || 0,
        campaignId: campaignId
      }
    };
  }
  
  /**
   * Pomocnicza funkcja do generowania opóźnienia
   * @param min - minimalne opóźnienie w ms
   * @param max - maksymalne opóźnienie w ms
   */
  private delay(min: number, max: number): Promise<void> {
    const delayTime = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delayTime));
  }
}

// Eksportujemy instancję klasy
export const googleAdsApi = new GoogleAdsApiMock();