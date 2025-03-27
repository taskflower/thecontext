// src/components/RD2/solarDataService.ts
import { pobierzDaneFotowoltaika } from './fotoPast/api';
import type { WynikiAPI, DaneFarmy } from './fotoPast/types';

export interface SolarProductionData {
  date: string;
  hour: number;
  totalProductionMWh: number;
  installedCapacityMW: number;
  efficiencyPercent: number;
  weatherConditions: {
    temperature: string;
    cloudCover: string;
    sunHours: string;
  };
  activeFarms: number;
  bestFarm?: string;
}

/**
 * Service that integrates fotoPast API with the energy trading application
 */
export class SolarDataService {
  /**
   * Fetches solar production data for a specific date and hour
   */
  public async getSolarProductionData(date: string, hour: string): Promise<SolarProductionData | null> {
    try {
      const hourFormatted = `${hour.padStart(2, '0')}:00`;
      
      // First try to get real data from API
      try {
        const result = await pobierzDaneFotowoltaika(date, hourFormatted, true);
        
        if (!result.error) {
          return this.processSolarData(result, parseInt(hour));
        }
      } catch (apiError) {
        console.warn('Could not fetch real solar data, falling back to mock data', apiError);
      }
      
      // If API fails, generate mock data
      return this.generateMockSolarData(date, parseInt(hour));
    } catch (error) {
      console.error('Error in solar data service:', error);
      return null;
    }
  }
  
  /**
   * Generates mock solar production data when API is unavailable
   */
  private generateMockSolarData(date: string, hour: number): SolarProductionData {
    // Parse date to create deterministic but varied mock data
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    
    // Generate mock values based on hour of day
    const isDaytime = hour >= 6 && hour <= 20;
    const peakProduction = hour >= 10 && hour <= 15;
    
    // Calculate a base efficiency factor (0-1) based on time of day
    // Mimics a bell curve peaking at noon
    const hourFactor = isDaytime 
      ? 1 - Math.abs(hour - 13) / 10 
      : 0;
    
    // Add some variability based on date
    const dateFactor = (day % 5) / 10;
    let efficiencyFactor = hourFactor + dateFactor;
    if (efficiencyFactor > 1) efficiencyFactor = 1;
    
    // Spring/summer months have better solar conditions
    const seasonalFactor = (month >= 3 && month <= 9) ? 1.2 : 0.8;
    efficiencyFactor *= seasonalFactor;
    
    // Calculate mock values
    const installedCapacity = 1720; // MW - sum of all active farms
    const efficiency = Math.round(efficiencyFactor * 65); // percentage
    const production = Math.round(installedCapacity * efficiencyFactor);
    
    // Generate weather conditions appropriate for the efficiency
    const temperature = peakProduction 
      ? (15 + day % 10).toFixed(1) 
      : (8 + day % 8).toFixed(1);
    
    const cloudCover = peakProduction 
      ? (2 + day % 3).toFixed(1) 
      : (4 + day % 4).toFixed(1);
    
    const sunHours = hourFactor > 0.5 
      ? (0.7 + hourFactor * 0.3).toFixed(1) 
      : (0.2 + hourFactor * 0.4).toFixed(1);
    
    // Return mock data
    return {
      date: date,
      hour: hour,
      totalProductionMWh: production,
      installedCapacityMW: installedCapacity,
      efficiencyPercent: efficiency,
      weatherConditions: {
        temperature: temperature,
        cloudCover: cloudCover,
        sunHours: sunHours
      },
      activeFarms: 14,
      bestFarm: ["Kleczew", "Zwartowo", "Przykona"][day % 3]
    };
  }
  
  /**
   * Processes the raw response from fotoPast API into a format suitable for the application
   */
  private processSolarData(apiResult: WynikiAPI, hour: number): SolarProductionData {
    // Extract relevant information from the API response
    const { statystyki, data_pobrania, farmy } = apiResult;
    
    // Find farms with available production data
    const farmsWithProduction = farmy.filter(
      farm => farm.produkcja && farm.produkcja.produkcja_szacowana_MWh
    );
    
    // Aggregate weather conditions from all farms
    const weatherData = this.aggregateWeatherData(farmsWithProduction);
    
    return {
      date: data_pobrania.data,
      hour: hour,
      totalProductionMWh: parseFloat(statystyki.szacowana_produkcja_MWh),
      installedCapacityMW: parseFloat(statystyki.suma_mocy_MW),
      efficiencyPercent: parseFloat(statystyki.srednia_wydajnosc_procent),
      weatherConditions: weatherData,
      activeFarms: statystyki.liczba_farm_dzialajacych,
      bestFarm: statystyki.najlepsza_farma || undefined
    };
  }
  
  /**
   * Calculates average weather conditions from all farms
   */
  private aggregateWeatherData(farms: DaneFarmy[]): {
    temperature: string;
    cloudCover: string;
    sunHours: string;
  } {
    const farmsWithWeather = farms.filter(
      farm => farm.produkcja?.warunki && farm.dane_pogodowe
    );
    
    if (farmsWithWeather.length === 0) {
      return {
        temperature: 'N/A',
        cloudCover: 'N/A',
        sunHours: 'N/A'
      };
    }
    
    // Calculate average temperature
    const temperatures = farmsWithWeather
      .map(farm => farm.produkcja?.warunki.temperatura)
      .filter(temp => temp !== 'brak danych')
      .map(temp => parseFloat(temp || '0'));
    
    const avgTemperature = temperatures.length > 0
      ? temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length
      : 0;
    
    // Calculate average cloud cover
    const cloudCovers = farmsWithWeather
      .map(farm => farm.produkcja?.warunki.zachmurzenie)
      .filter(cloud => cloud !== 'brak danych')
      .map(cloud => parseFloat(cloud || '0'));
    
    const avgCloudCover = cloudCovers.length > 0
      ? cloudCovers.reduce((sum, cloud) => sum + cloud, 0) / cloudCovers.length
      : 0;
    
    // Calculate average sun hours
    const sunHours = farmsWithWeather
      .map(farm => farm.produkcja?.warunki.uslonecznienie)
      .filter(sun => sun !== 'brak danych')
      .map(sun => parseFloat(sun || '0'));
    
    const avgSunHours = sunHours.length > 0
      ? sunHours.reduce((sum, sun) => sum + sun, 0) / sunHours.length
      : 0;
    
    return {
      temperature: avgTemperature.toFixed(1),
      cloudCover: avgCloudCover.toFixed(1),
      sunHours: avgSunHours.toFixed(1)
    };
  }
  
  /**
   * Fetches solar production data for all historical dates in the provided range
   */
  public async getHistoricalSolarData(
    startDate: string,
    endDate: string
  ): Promise<Record<string, SolarProductionData[]>> {
    const result: Record<string, SolarProductionData[]> = {};
    
    try {
      // Parse start and end dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Loop through each day
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];
        result[dateStr] = [];
        
        // Get data for key daylight hours (6-20)
        for (let hour = 6; hour <= 20; hour++) {
          const hourData = await this.getSolarProductionData(dateStr, hour.toString());
          if (hourData) {
            result[dateStr].push(hourData);
          }
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching historical solar data:', error);
      return result;
    }
  }
}

export const solarDataService = new SolarDataService();