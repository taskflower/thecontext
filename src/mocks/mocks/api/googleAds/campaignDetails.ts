// src/mocks/api/googleAds/campaignDetails.ts
export const mockCampaignDetails = (campaignId: string) => {
    // Baza podstawowych danych dla każdej kampanii
    const baseData = {
      success: true,
      data: {
        id: campaignId,
        name: `Kampania produktowa ${campaignId.slice(-4)}`,
        status: Math.random() > 0.3 ? "ENABLED" : "PAUSED",
        budget: {
          amountMicros: Math.floor(Math.random() * 50000000) + 10000000, // 10-60 PLN
          delivery_method: "STANDARD"
        },
        advertisingChannelType: ["SEARCH", "DISPLAY", "VIDEO"][Math.floor(Math.random() * 3)],
        startDate: "20250201",
        endDate: Math.random() > 0.5 ? "20251201" : undefined,
        metrics: {
          impressions: Math.floor(Math.random() * 10000) + 100,
          clicks: Math.floor(Math.random() * 500) + 10,
          ctr: (Math.random() * 0.05) + 0.01, // 1-6%
          averageCpc: Math.floor(Math.random() * 1000000) + 100000, // 0.1-1.1 PLN
          cost: Math.floor(Math.random() * 50000000) + 1000000, // 1-51 PLN
          conversions: Math.floor(Math.random() * 20),
          conversionRate: Math.random() * 0.02,
        }
      }
    };
  
    // Predefinowane kampanie z konkretnym ID dla większej stabilności danych
    const predefinedCampaigns: Record<string, any> = {
      "1234567890": {
        success: true,
        data: {
          id: "1234567890",
          name: "Promocja wiosenna - buty sportowe",
          status: "ENABLED",
          budget: {
            amountMicros: 30000000, // 30 PLN
            delivery_method: "STANDARD"
          },
          advertisingChannelType: "SEARCH",
          startDate: "20250401",
          endDate: "20250630",
          metrics: {
            impressions: 5426,
            clicks: 287,
            ctr: 0.0529,
            averageCpc: 580000, // 0.58 PLN
            cost: 16646000, // 16.65 PLN
            conversions: 12,
            conversionRate: 0.0418
          }
        }
      },
      "2345678901": {
        success: true,
        data: {
          id: "2345678901",
          name: "Wyprzedaż letnia - odzież",
          status: "ENABLED",
          budget: {
            amountMicros: 50000000, // 50 PLN
            delivery_method: "STANDARD"
          },
          advertisingChannelType: "DISPLAY",
          startDate: "20250515",
          endDate: "20250815",
          metrics: {
            impressions: 12534,
            clicks: 453,
            ctr: 0.0361,
            averageCpc: 420000, // 0.42 PLN
            cost: 19026000, // 19.03 PLN
            conversions: 8,
            conversionRate: 0.0176
          }
        }
      },
      "3456789012": {
        success: true,
        data: {
          id: "3456789012",
          name: "Produkty premium - elektronika",
          status: "PAUSED",
          budget: {
            amountMicros: 70000000, // 70 PLN
            delivery_method: "STANDARD"
          },
          advertisingChannelType: "VIDEO",
          startDate: "20250310",
          endDate: undefined,
          metrics: {
            impressions: 3245,
            clicks: 98,
            ctr: 0.0302,
            averageCpc: 830000, // 0.83 PLN
            cost: 8134000, // 8.13 PLN
            conversions: 3,
            conversionRate: 0.0306
          }
        }
      }
    };
  
    // Zwróć predefinowaną kampanię, jeśli istnieje, w przeciwnym razie wygeneruj dynamiczne dane
    return predefinedCampaigns[campaignId] || baseData;
  };
  
  // Symulacja błędu API
  export const mockCampaignDetailsError = () => {
    return {
      success: false,
      error: {
        code: "CAMPAIGN_NOT_FOUND",
        message: "Nie udało się znaleźć kampanii o podanym identyfikatorze"
      }
    };
  };