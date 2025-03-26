interface DataPoint {
    date: string;
    hour: number;
    rdnPrice: number;
    rbPrice: number;
    priceDiff: number;
    isPriceHigher: boolean;
    imbalance: number;
    windProduction: number;
    solarProduction: number;
    demandForecast: number;
    isWorkday: boolean;
  }
  
  // Generate sample data for the energy trading application
  export const generateSampleData = (): DataPoint[] => {
    const data: DataPoint[] = [];
    const days = 14;
    
    for (let day = 0; day < days; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      const dateStr = date.toISOString().split('T')[0];
      const isWorkday = date.getDay() >= 1 && date.getDay() <= 5;
      
      for (let hour = 0; hour < 24; hour++) {
        const peakHour = hour >= 8 && hour <= 20;
        const highDemand = peakHour && isWorkday;
        
        // Factors affecting price
        const windFactor = 0.3 + Math.random() * 0.7;
        const solarFactor = hour >= 8 && hour <= 17 ? 0.4 + Math.random() * 0.6 : 0;
        const demandFactor = 0.8 + Math.random() * 0.4;
        
        // Base price calculations
        const rdnBasePrice = 280 + (highDemand ? 100 : 0) - (solarFactor * 50) - (windFactor * 40);
        const rdnPrice = Math.round(rdnBasePrice * (0.95 + Math.random() * 0.1));
        
        // Randomly decide if RB is higher or lower than RDN
        const imbalance = (Math.random() > 0.6 ? 1 : -1) * (Math.random() * 400 + 100);
        const rbVsRdnFactor = imbalance > 0 ? 1 + Math.random() * 0.2 : 0.85 + Math.random() * 0.1;
        const rbPrice = Math.round(rdnPrice * rbVsRdnFactor);
        
        data.push({
          date: dateStr,
          hour,
          rdnPrice,
          rbPrice,
          priceDiff: rbPrice - rdnPrice,
          isPriceHigher: rbPrice > rdnPrice,
          imbalance,
          windProduction: Math.round(windFactor * 2500),
          solarProduction: Math.round(solarFactor * 2000),
          demandForecast: Math.round(18000 + (peakHour ? 4000 : 0) * demandFactor),
          isWorkday
        });
      }
    }
    
    return data.sort((a, b) => {
      const dateComp = b.date.localeCompare(a.date);
      return dateComp !== 0 ? dateComp : a.hour - b.hour;
    });
  };