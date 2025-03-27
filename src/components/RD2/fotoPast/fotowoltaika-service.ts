import { 
  DaneFarmy, 
  StatystykiProdukcji, 
  WynikiAPI 
} from './types';
import { farmy, mapowanieStacji } from './data';
import { imgwService } from './imgw-service';
import { ProdukcjaService } from './produkcja-service';

export class FotowoltaikaService {
  private readonly produkcjaService = new ProdukcjaService();
  
  /**
   * Pobiera dane pogodowe dla wszystkich farm
   * @param data - Data w formacie YYYY-MM-DD
   * @param godzina - Godzina w formacie HH:MM
   * @param tylkoDzialajace - Flaga określająca czy pobierać dane tylko dla działających farm
   * @returns Tablica z danymi dla wszystkich farm
   */
  public async pobierzDaneDlaFarm(
    data: string, 
    godzina: string, 
    tylkoDzialajace: boolean = true
  ): Promise<DaneFarmy[]> {
    const wyniki: DaneFarmy[] = [];
    
    for (const farma of farmy) {
      // Pomijamy farmy w budowie i planowane jeśli tylkoDzialajace=true
      if (tylkoDzialajace && farma.status !== "działająca") {
        wyniki.push({
          farma: farma,
          dane_pogodowe: null,
          informacja: `Farma ${farma.lokalizacja} ma status: ${farma.status}`
        });
        continue;
      }
      
      const stacja = mapowanieStacji[farma.lokalizacja];
      if (!stacja) {
        wyniki.push({
          farma: farma,
          dane_pogodowe: null,
          informacja: "Brak mapowania do stacji IMGW"
        });
        continue;
      }
      
      const danePogodowe = await imgwService.pobierzDanePogodowe(stacja, data, godzina);
      
      wyniki.push({
        farma: farma,
        stacja_imgw: stacja,
        dane_pogodowe: danePogodowe
      });
    }
    
    return wyniki;
  }
  
  /**
   * Oblicza statystyki produkcji na podstawie danych farm
   * @param daneZProdukcja - Dane farm z obliczoną produkcją
   * @returns Statystyki produkcji
   */
  private obliczStatystyki(daneZProdukcja: DaneFarmy[]): StatystykiProdukcji {
    let sumaMocy = 0;
    let sumaProdukcji = 0;
    let liczbaFarmZDanymi = 0;
    let najlepszeNaslonecznienie = 0;
    let najlepszaFarma: string | null = null;
    
    daneZProdukcja.forEach(entry => {
      if (entry.produkcja && entry.produkcja.produkcja_szacowana_MWh) {
        sumaMocy += entry.farma.moc_MW;
        sumaProdukcji += parseFloat(entry.produkcja.produkcja_szacowana_MWh);
        liczbaFarmZDanymi++;
        
        // Sprawdzenie czy to najlepsza farma pod względem nasłonecznienia
        if (entry.produkcja.wspolczynnik_naslonecznienia > najlepszeNaslonecznienie) {
          najlepszeNaslonecznienie = entry.produkcja.wspolczynnik_naslonecznienia;
          najlepszaFarma = entry.farma.lokalizacja;
        }
      }
    });
    
    const sredniaWydajnosc = liczbaFarmZDanymi > 0 ? (sumaProdukcji / sumaMocy) * 100 : 0;
    
    return {
      liczba_farm_dzialajacych: liczbaFarmZDanymi,
      suma_mocy_MW: sumaMocy.toFixed(2),
      szacowana_produkcja_MWh: sumaProdukcji.toFixed(2),
      srednia_wydajnosc_procent: sredniaWydajnosc.toFixed(2),
      najlepsza_farma: najlepszaFarma,
      najlepsze_naslonecznienie: najlepszeNaslonecznienie.toFixed(2)
    };
  }
  
  /**
   * Pobiera dane dla farm i oblicza szacowaną produkcję energii
   * @param data - Data w formacie YYYY-MM-DD
   * @param godzina - Godzina w formacie HH:MM
   * @param tylkoDzialajace - Flaga określająca czy pobierać dane tylko dla działających farm
   * @returns Obiekt z danymi dla wszystkich farm i statystykami
   */
  public async pobierzDaneProdukcji(
    data: string, 
    godzina: string, 
    tylkoDzialajace: boolean = true
  ): Promise<WynikiAPI> {
    const daneFarm = await this.pobierzDaneDlaFarm(data, godzina, tylkoDzialajace);
    
    // Dodanie informacji o szacowanej produkcji dla każdej farmy
    const daneZProdukcja = daneFarm.map(entry => {
      if (entry.dane_pogodowe && !entry.dane_pogodowe.error) {
        const produkcja = this.produkcjaService.obliczProdukcjeEnergii(
          entry.dane_pogodowe, 
          entry.farma.moc_MW
        );
        return { ...entry, produkcja };
      }
      return entry;
    });
    
    const statystyki = this.obliczStatystyki(daneZProdukcja);
    
    return {
      data_pobrania: {
        data,
        godzina
      },
      farmy: daneZProdukcja,
      statystyki
    };
  }
}

// Eksport singletona
export const fotowoltaikaService = new FotowoltaikaService();