**Role i zakres CRUD w e-Operator (wersja skrócona):**

---

### 1. Beneficjent (klient/inwestor)

* **C** (Create):

  * Zakłada zapytanie o kontakt z operatorem (zakładka 1)
  * Składa zapytanie/zlecenie na wykonawcę (zakładka 2)
  * Składa zapytanie o audytora (zakładka 4)
* **R** (Read):

  * Przegląda status własnych zapytań (panel utworzonych zleceń, zakładka 8)
  * Podgląda oferty wykonawców/audytorów odpowiednio pod każdym swoim zleceniem
* **U** (Update):

  * Edytuje treść zapytania (zakres prac, dane kontaktowe) przed weryfikacją operatora
  * Dodaje opinię o wykonawcy/audytorze po realizacji
* **D** (Delete):

  * Usuwa własne zapytanie (jeśli nie podjęto jeszcze żadnej oferty)

---

### 2. Wykonawca

* **C**:

  * Zakłada i uzupełnia portfolio (zakładka 6)
  * Przesyła ofertę na wybrane zlecenie (zakładka 3)
* **R**:

  * Przegląda aktywne zlecenia w “Giełdzie Wykonawców” (zakładka 3)
  * Podgląda swoje złożone oferty i ich status
* **U**:

  * Edytuje swoje portfolio (opis, zdjęcia)
  * Modyfikuje treść oferty (cena, zakres realizacji)
* **D**:

  * Usuwa własne portfolio
  * Wycofuje złożoną ofertę (jeśli nie została zaakceptowana)

---

### 3. Audytor

* **C**:

  * Zakłada i uzupełnia portfolio (zakładka 7)
  * Przesyła ofertę na wybrane zapytanie o audytora (zakładka 5)
* **R**:

  * Przegląda aktywne zapytania w “Giełdzie Audytorów” (zakładka 5)
  * Podgląda swoje złożone oferty i ich status
* **U**:

  * Edytuje swoje portfolio (opis, certyfikaty, dane kontaktowe)
  * Modyfikuje ofertę audytu (cena, czas realizacji)
* **D**:

  * Usuwa własne portfolio
  * Wycofuje ofertę audytu (jeśli nie została zaakceptowana)

---

### 4. Operator (zweryfikowany przez administrację)

* **C**:

  * Tworzy/aktualizuje profil operatora programu (dane instytucji)
  * Generuje raporty/statystyki (zapytania, aktywność)
* **R**:

  * Przegląda wszystkie zapytania o wykonawców (zakładki 2 i 3) oraz audytorów (zakładki 4 i 5)
  * Monitoruje panel utworzonych zleceń beneficjentów (zakładka 8)
* **U**:

  * Weryfikuje/oznacza jako „zweryfikowane” zapytania i oferty (usuwa dane wrażliwe)
  * Edytuje status zlecenia (blokuje nadużycia, moderuje opinie)
* **D**:

  * Usuwa/odrzuca nieprawidłowe zapytania/oferty (spam, duplikaty)
  * Dezaktywuje konta wykonawców/audytorów w razie naruszeń regulaminu

---

### 5. Administrator (systemowy)

* **C**:

  * Nadaje nowe konta operatorom, wykonawcom, audytorom
  * Definiuje kategorie usług, regiony, system punktów (moderacja giełd)
* **R**:

  * Przegląda listę wszystkich użytkowników (beneficjentów, wykonawców, audytorów, operatorów)
  * Ogląda logi aktywności i statystyki użycia aplikacji
* **U**:

  * Zarządza uprawnieniami ról (modyfikuje zakres dostępu użytkowników)
  * Aktualizuje konfigurację aplikacji (stawki punktów, limity)
* **D**:

  * Blokuje/usuwa dowolne konto użytkownika (wykonawcę, audytora, operatora)
  * Kasuje lub cofa instancje danych (np. nielegalne oferty)

---

**Uwagi ogólne:**

* Każde zapytanie lub oferta przechodzi automatyczną moderację: przed publikacją usuwa się dane wrażliwe (adres, pełne dane osobowe), zachowując jedynie kod pocztowy i zakres prac.
* System punktów jest walutą wewnętrzną: wykonawcy/audytorzy “kupują” dostęp do numerów telefonów i szczegółów beneficjentów.
* Panel „utworzonych zleceń” (zakładka 8) pozwala beneficjentowi zobaczyć wszystkie swoje zapytania, rozwinąć je, przejrzeć listę ofert (portfolio) i zostawić opinię po zakończeniu współpracy.

---

**Lista pól formularzy (wszystkie zakładki):**

1. **Zakładka 1: Kontakt Klienta (Beneficjenta) z Operatorem**

   * **Kalkulator dotacji:**

     1. Liczba członków gospodarstwa domowego
     2. Łączny dochód gospodarstwa domowego
     3. Czy wszyscy współwłaściciele żyją? (tak/nie)
   * **Formularz zgłoszenia kontaktu:**

     1. Kod pocztowy
     2. Miejscowość
     3. Numer telefonu

2. **Zakładka 2: Wyszukiwarka Wykonawców (Składanie Zlecenia)**

   1. Kod pocztowy
   2. Miejscowość
   3. Ulica i numer domu
   4. Numer telefonu
   5. Zakres prac (wybór na dwóch listach):

      * Źródło ciepła:

        * Pompa ciepła
        * Piec na pellet
        * Piec zgazowujący drewno
      * Termomodernizacja:

        * Okna (ilość)
        * Drzwi (ilość)
        * Docieplenie ścian (m²)
        * Docieplenie poddasza (m²)
   6. Miejsce na wklejenie audytu efektywności (bez danych adresowych i imiennych)

3. **Zakładka 3: Giełda Wykonawców**

   * (brak nowych pól; wyświetlane zlecenia z zakładki 2 po moderacji)

4. **Zakładka 4: Wyszukiwarka Audytorów**

   1. Kod pocztowy
   2. Miejscowość
   3. Ulica i numer domu
   4. Numer telefonu

5. **Zakładka 5: Giełda Audytorów**

   * (lista zleceń z zakładki 4 po moderacji)

6. **Zakładka 6: Stwórz portfolio Wykonawcy**

   1. Dane rejestrowe firmy (nazwa, NIP, adres)
   2. Opis działalności i oferowanych usług
   3. Galeria zdjęć „przed/po” realizacji (możliwość dodania wielu zdjęć z opisem)

7. **Zakładka 7: Stwórz portfolio Audytora**

   1. Dane rejestrowe audytora (imię i nazwisko lub nazwa firmy, certyfikat)
   2. Opis kwalifikacji i doświadczenia
   3. Skan certyfikatu energetycznego

8. **Zakładka 8: Panel utworzonych Zleceń (Beneficjenta)**

   * Wyświetlane elementy (bez nowych pól do wypełnienia):

     * Kod pocztowy
     * Zakres prac
     * Status weryfikacji przez operatora
     * Lista ofert (portfolio, dane wykonawców/audytorów)
     * Możliwość dodania opinii:

       * Treść opinii
       * Ocena

---

Powyższe zestawienie łączy role i operacje CRUD z kompletną listą pól w każdej zakładce aplikacji.