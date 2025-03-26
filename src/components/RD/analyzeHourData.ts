interface HourData {
    hour: number;
    rdnPrice: number;
    rbPrice: number;
    priceDiff: number;
    imbalance: number;
    date: string;
    isPriceHigher: boolean;
    windProduction: number;
    solarProduction: number;
    demandForecast: number;
    isWorkday: boolean;
  }
  
  interface HourlyStats {
    totalEntries: number;
    rbHigherCount: number;
    rbHigherPercent: number;
    avgPriceDiff: number;
    avgAbsPriceDiff: number;
    imbalanceVsPriceDiff: Array<{
      imbalance: number;
      priceDiff: number;
    }>;
  }
  
  // Analyze hourly data
  export const analyzeHourData = (hourData: HourData[]): HourlyStats | null => {
    if (!hourData || !hourData.length) return null;
    
    const totalEntries = hourData.length;
    const rbHigherCount = hourData.filter(d => d.rbPrice > d.rdnPrice).length;
    const rbHigherPercent = Math.round((rbHigherCount / totalEntries) * 100);
    
    // Calculate average price difference
    const sum = hourData.reduce((acc, item) => acc + item.priceDiff, 0);
    const avgPriceDiff = Math.round(sum / totalEntries);
    
    // Calculate average absolute price difference
    const absSum = hourData.reduce((acc, item) => acc + Math.abs(item.priceDiff), 0);
    const avgAbsPriceDiff = Math.round(absSum / totalEntries);
    
    // Create data for correlation chart
    const imbalanceVsPriceDiff = hourData.map(d => ({
      imbalance: d.imbalance,
      priceDiff: d.priceDiff
    }));
    
    return {
      totalEntries,
      rbHigherCount,
      rbHigherPercent,
      avgPriceDiff,
      avgAbsPriceDiff,
      imbalanceVsPriceDiff
    };
  };