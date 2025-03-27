// types.ts
export interface Farma {
  lokalizacja: string;
  moc_MW: number;
  status: 'działająca' | 'w budowie' | 'planowana';
}

export interface DanePogodowe {
  id_stacji?: string;
  stacja?: string;
  data_pomiaru?: string;
  godzina_pomiaru?: string;
  temperatura?: string;
  predkosc_wiatru?: string;
  kierunek_wiatru?: string;
  wilgotnosc_wzgledna?: string;
  suma_opadu?: string;
  cisnienie?: string;
  zachmurzenie?: string;
  uslon?: string;
  error?: string;
}

export interface ProdukcjaEnergii {
  wspolczynnik_naslonecznienia: number;
  wspolczynnik_temperatury: number;
  produkcja_szacowana_MWh: string;
  warunki: {
    temperatura: string;
    zachmurzenie: string;
    uslonecznienie: string;
    predkosc_wiatru: string;
    suma_opadu: string;
  };
}

export interface DaneFarmy {
  farma: Farma;
  stacja_imgw?: string;
  dane_pogodowe: DanePogodowe | null;
  produkcja?: ProdukcjaEnergii | null;
  informacja?: string;
}

export interface StatystykiProdukcji {
  liczba_farm_dzialajacych: number;
  suma_mocy_MW: string;
  szacowana_produkcja_MWh: string;
  srednia_wydajnosc_procent: string;
  najlepsza_farma: string | null;
  najlepsze_naslonecznienie: string;
}

export interface WynikiAPI {
  data_pobrania: {
    data: string;
    godzina: string;
  };
  farmy: DaneFarmy[];
  statystyki: StatystykiProdukcji;
  error?: string;
}

export interface MapowanieStacji {
  [lokalizacja: string]: string;
}