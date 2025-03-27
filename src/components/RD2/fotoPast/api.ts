import { WynikiAPI } from './types';
import { fotowoltaikaService } from './fotowoltaika-service';

/**
 * Główna funkcja API - pobiera dane dla wszystkich farm fotowoltaicznych
 * 
 * @param data - Data w formacie YYYY-MM-DD
 * @param godzina - Godzina w formacie HH:MM
 * @param tylkoDzialajace - Flaga określająca czy pobierać dane tylko dla działających farm
 * @returns Dane dla wszystkich farm wraz ze statystykami
 */
export async function pobierzDaneFotowoltaika(
  data: string, 
  godzina: string, 
  tylkoDzialajace: boolean = true
): Promise<WynikiAPI> {
  try {
    return await fotowoltaikaService.pobierzDaneProdukcji(data, godzina, tylkoDzialajace);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      error: `Wystąpił błąd podczas pobierania danych: ${errorMessage}`,
      data_pobrania: {
        data,
        godzina
      },
      farmy: [],
      statystyki: {
        liczba_farm_dzialajacych: 0,
        suma_mocy_MW: "0.00",
        szacowana_produkcja_MWh: "0.00",
        srednia_wydajnosc_procent: "0.00",
        najlepsza_farma: null,
        najlepsze_naslonecznienie: "0.00"
      }
    };
  }
}

// Eksport funkcji i typów
export * from './types';
export { imgwService } from './imgw-service';
export { farmy, mapowanieStacji } from './data';