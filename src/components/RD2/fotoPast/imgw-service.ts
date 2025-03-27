import { DanePogodowe } from './types';

export class IMGWService {
  private readonly baseUrl = 'https://danepubliczne.imgw.pl/api/data/synop';

  /**
   * Pobiera dane pogodowe dla konkretnej stacji IMGW
   * @param stacja - Nazwa stacji IMGW
   * @param data - Data w formacie YYYY-MM-DD
   * @param godzina - Godzina w formacie HH:MM
   * @returns Obiekt z danymi pogodowymi
   */
  public async pobierzDanePogodowe(stacja: string, data: string, godzina: string): Promise<DanePogodowe> {
    try {
      // Format danych z IMGW zazwyczaj nie uwzględnia konkretnej godziny w URL
      // Pobieramy dane z całego dnia i filtrujemy po godzinie
      const url = `${this.baseUrl}/station/${stacja}/date/${data}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const responseData = await response.json() as DanePogodowe[];
      
      // Sprawdzamy czy otrzymaliśmy dane
      if (!responseData || responseData.length === 0) {
        return { error: `Brak danych dla stacji ${stacja} w dniu ${data}` };
      }
      
      // Filtrujemy do najbliższej dostępnej godziny
      // IMGW najczęściej udostępnia dane co 3 godziny
      const godzinaDocelowa = parseInt(godzina.split(':')[0]);
      let najblizszaGodzina: DanePogodowe | null = null;
      let minimalnaDelta = 24;
      
      for (const pomiar of responseData) {
        if (pomiar.godzina_pomiaru) {
          const godzinaPomiaru = parseInt(pomiar.godzina_pomiaru);
          const delta = Math.abs(godzinaPomiaru - godzinaDocelowa);
          
          if (delta < minimalnaDelta) {
            minimalnaDelta = delta;
            najblizszaGodzina = pomiar;
          }
        }
      }
      
      if (!najblizszaGodzina) {
        return { error: `Brak danych o odpowiedniej godzinie dla stacji ${stacja} w dniu ${data}` };
      }
      
      return najblizszaGodzina;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { error: `Błąd podczas pobierania danych: ${errorMessage}` };
    }
  }

  /**
   * Pobiera listę wszystkich dostępnych stacji IMGW
   * @returns Lista stacji
   */
  public async pobierzListeStacji(): Promise<string[]> {
    try {
      const response = await fetch(this.baseUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json() as DanePogodowe[];
      
      if (!data || data.length === 0) {
        return [];
      }
      
      return data.map(stacja => stacja.stacja || '').filter(Boolean);
    } catch (error) {
      console.error('Błąd podczas pobierania listy stacji:', error);
      return [];
    }
  }
}

// Eksport singletona
export const imgwService = new IMGWService();