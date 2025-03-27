
import { DanePogodowe, ProdukcjaEnergii } from './types';

export class ProdukcjaService {
  /**
   * Oblicza przybliżoną produkcję energii dla farmy PV na podstawie nasłonecznienia
   * @param daneStacji - Dane pogodowe ze stacji IMGW
   * @param mocFarmy - Moc farmy w MW
   * @returns Informacje o produkcji energii
   */
  public obliczProdukcjeEnergii(daneStacji: DanePogodowe | null, mocFarmy: number): ProdukcjaEnergii | null {
    if (!daneStacji || daneStacji.error) {
      return null;
    }
    
    // Uproszczony model:
    // 1. Wykorzystujemy usłonecznienie (jeśli dostępne) lub zachmurzenie
    // 2. Temperatura wpływa na wydajność paneli fotowoltaicznych
    
    let wspolczynnikNaslonecznienia = 0;
    
    // Sprawdzamy czy mamy dane o usłonecznieniu
    if (daneStacji.uslon) {
      // Usłonecznienie w godzinach (np. 1.5 oznacza 1.5h słońca w ciągu 3h okresu)
      wspolczynnikNaslonecznienia = parseFloat(daneStacji.uslon) / 3;
    } else if (daneStacji.zachmurzenie) {
      // Zachmurzenie w oktantach (0-8, gdzie 0 to bezchmurne niebo)
      wspolczynnikNaslonecznienia = 1 - (parseFloat(daneStacji.zachmurzenie) / 8);
    } else {
      return {
        wspolczynnik_naslonecznienia: 0,
        wspolczynnik_temperatury: 1,
        produkcja_szacowana_MWh: "0.00",
        warunki: {
          temperatura: "brak danych",
          zachmurzenie: "brak danych",
          uslonecznienie: "brak danych",
          predkosc_wiatru: "brak danych",
          suma_opadu: "brak danych"
        }
      };
    }
    
    // Współczynnik korekcji temperatury - panele są mniej wydajne w wysokich temperaturach
    // Typowo panele tracą ok. 0.4-0.5% wydajności na każdy stopień powyżej 25°C
    const temperaturaOdniesienia = 25;
    const wspolczynnikTemperatury = 0.004; // 0.4% na stopień
    
    let wspolczynnikWydajnosciTemp = 1;
    if (daneStacji.temperatura) {
      const temperatura = parseFloat(daneStacji.temperatura);
      if (temperatura > temperaturaOdniesienia) {
        wspolczynnikWydajnosciTemp = 1 - ((temperatura - temperaturaOdniesienia) * wspolczynnikTemperatury);
      }
    }
    
    // Szacowana produkcja energii w MWh
    // Zakładamy uproszczony model: moc * współczynnik nasłonecznienia * współczynnik temperatury
    const produkcjaMWh = mocFarmy * wspolczynnikNaslonecznienia * wspolczynnikWydajnosciTemp;
    
    return {
      wspolczynnik_naslonecznienia: wspolczynnikNaslonecznienia,
      wspolczynnik_temperatury: wspolczynnikWydajnosciTemp,
      produkcja_szacowana_MWh: produkcjaMWh.toFixed(2),
      warunki: {
        temperatura: daneStacji.temperatura || "brak danych",
        zachmurzenie: daneStacji.zachmurzenie || "brak danych",
        uslonecznienie: daneStacji.uslon || "brak danych",
        predkosc_wiatru: daneStacji.predkosc_wiatru || "brak danych",
        suma_opadu: daneStacji.suma_opadu || "brak danych"
      }
    };
  }
}