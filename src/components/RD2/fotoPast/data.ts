import { Farma, MapowanieStacji } from "./types";

export const elektrownieWiatrowe = [
  {
    name: "Farma Wiatrowa Baczyna",
    location: "Lubuskie (gm. Lubiszyn, Lubno/Baczyna)",
    capacity_MW: 14.1,
    status: "działająca",
  },

  {
    name: "Morska Farma Wiatrowa Silesia II (Grodków)",
    location: "Opolskie (gm. Grodków)",
    capacity_MW: 137.0,
    status: "w budowie",
  },
  {
    name: "Morska Farma Wiatrowa Orlen Neptun 46.E.1",
    location: "Morze Bałtyckie (Polska EEZ)",
    capacity_MW: 966.0,
    status: "planowana",
  },
];

export const farmy: Farma[] = [
  {
    lokalizacja: "Kleczew (wielkopolskie)",
    moc_MW: 250.7,
    status: "działająca",
  },
  {
    lokalizacja: "Zwartowo (pomorskie)",
    moc_MW: 204,
    status: "działająca",
  },
  {
    lokalizacja: "Przykona (wielkopolskie)",
    moc_MW: 200,
    status: "działająca",
  },
  {
    lokalizacja: "Kotla (dolnośląskie)",
    moc_MW: 130,
    status: "w budowie",
  },

  {
    lokalizacja: "Stara Korytnica (zachodniopomorskie)",
    moc_MW: 60,
    status: "działająca",
  },
  {
    lokalizacja: "Stępień, gm. Braniewo (warmińsko-mazurskie)",
    moc_MW: 58,
    status: "działająca",
  },
  {
    lokalizacja: "Kleszczów (łódzkie)",
    moc_MW: 50,
    status: "planowana",
  },
  {
    lokalizacja: "Mysłowice (śląskie)",
    moc_MW: 37,
    status: "działająca",
  },
  {
    lokalizacja: "Gryf (wielkopolskie)",
    moc_MW: 25,
    status: "działająca",
  },
  {
    lokalizacja: "Wałcz (zachodniopomorskie)",
    moc_MW: 10,
    status: "działająca",
  },
];

export const mapowanieStacji: MapowanieStacji = {
  "Kleczew (wielkopolskie)": "kolo",
  "Zwartowo (pomorskie)": "lebork",
  "Przykona (wielkopolskie)": "kolo",
  "Kotla (dolnośląskie)": "legnica",
  "Miłkowice (dolnośląskie)": "legnica",
  "Brudzew (wielkopolskie)": "kolo",
  "Bielice, gm. Sochaczew (mazowieckie)": "warszawa",
  "Golczewo (zachodniopomorskie)": "szczecin",
  "Wietrzychowo, gm. Nidzica (warmińsko-mazurskie)": "olsztyn",
  "Wielbark (warmińsko-mazurskie)": "olsztyn",
  "Witnica (lubuskie)": "gorzow",
  "Zagórzyca, gm. Damnica (pomorskie)": "slupsk",
  "Krzeczów, gm. Rzezawa (małopolskie)": "krakow",
  "Stara Korytnica (zachodniopomorskie)": "szczecin",
  "Stępień, gm. Braniewo (warmińsko-mazurskie)": "elblag",
  "Kleszczów (łódzkie)": "lodz",
  "Mysłowice (śląskie)": "katowice",
  "Gryf (wielkopolskie)": "poznan",
  "Wałcz (zachodniopomorskie)": "pila",
};
