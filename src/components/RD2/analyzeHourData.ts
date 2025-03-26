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
    if (!hourData || hourData.length === 0) return null;
    
    console.log(`Analyzing ${hourData.length} data points for hour ${hourData[0]?.hour}`);
    
    // Filter out any invalid data points
    const validData = hourData.filter(d => 
      typeof d.priceDiff === 'number' && 
      typeof d.imbalance === 'number' && 
      !isNaN(d.priceDiff) && 
      !isNaN(d.imbalance)
    );
    
    if (validData.length === 0) {
      console.error('No valid data points found after filtering');
      return null;
    }
    
    const totalEntries = validData.length;
    const rbHigherCount = validData.filter(d => d.rbPrice > d.rdnPrice).length;
    const rbHigherPercent = Math.round((rbHigherCount / totalEntries) * 100);
    
    // Calculate average price difference
    const sum = validData.reduce((acc, item) => acc + item.priceDiff, 0);
    const avgPriceDiff = Math.round(sum / totalEntries);
    
    // Calculate average absolute price difference
    const absSum = validData.reduce((acc, item) => acc + Math.abs(item.priceDiff), 0);
    const avgAbsPriceDiff = Math.round(absSum / totalEntries);
    
    // Create data for correlation chart
    const imbalanceVsPriceDiff = validData.map(d => ({
      imbalance: parseFloat(d.imbalance.toFixed(2)),
      priceDiff: parseFloat(d.priceDiff.toFixed(2))
    }));
    
    console.log(`Analysis complete - ${rbHigherCount} out of ${totalEntries} days had RB > RDN (${rbHigherPercent}%)`);
    console.log(`Created ${imbalanceVsPriceDiff.length} points for scatter chart`);
    
    return {
      totalEntries,
      rbHigherCount,
      rbHigherPercent,
      avgPriceDiff,
      avgAbsPriceDiff,
      imbalanceVsPriceDiff
    };
  };