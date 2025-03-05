Kurwa, to proste jak drut.

Na LLM Response:
- Nazwij: "Wygeneruj Kurwa Scenariusze"
- Opis: "Generuje przykładowe scenariusze marketingowe"
- Prompt:
```
Wygeneruj 5 scenariuszy marketingowych dla projektu: "{{projectName}}". 
Każdy musi mieć:
- tytuł
- opis (1-2 zdania)
- cel (konkretny)
- powiązania między scenariuszami
Każdy scenariusz inny focus: strategia contentu, social media, analityka, angażowanie odbiorców i świadomość marki.
Zwróć jako JSON z tablicą scenariuszy.
```
- Mock Response: Tak
- Format odpowiedzi: JSON
- Przykładowa odpowiedź:
```json
{
  "scenarios": [
    {
      "id": "scenario-1",
      "title": "Strategia Contentu",
      "description": "Stwórz plan contentu celujący w główne segmenty odbiorców.",
      "objective": "Zwiększenie ruchu o 30% w 3 miesiące",
      "connections": ["scenario-2", "scenario-5"]
    },
    {
      "id": "scenario-2",
      "title": "Kampania Social Media",
      "description": "Ogarnij kampanię na Insta, Twitter i LinkedIn.",
      "objective": "15% zaangażowania i 5000 nowych followersów",
      "connections": ["scenario-1"]
    },
    {
      "id": "scenario-3",
      "title": "Wdrożenie Analityki",
      "description": "Ustaw tracking i raportowanie dla wszystkich inicjatyw.",
      "objective": "Dashboard z KPI w czasie rzeczywistym",
      "connections": ["scenario-4"]
    },
    {
      "id": "scenario-4",
      "title": "Strategia Zaangażowania",
      "description": "Stwórz interaktywny content i inicjatywy budujące społeczność.",
      "objective": "Zwiększ czas na stronie o 25%",
      "connections": ["scenario-3", "scenario-5"]
    },
    {
      "id": "scenario-5",
      "title": "Kampania Świadomości Marki",
      "description": "Odpal kampanię multi-channel dla zwiększenia widoczności.",
      "objective": "Popraw metryki rozpoznawalności o 20%",
      "connections": ["scenario-1", "scenario-4"]
    }
  ]
}
```

Na Store Injector:
- Nazwij: "Zapisz Te Jebane Scenariusze"
- Opis: "Sprawdź i zapisz wygenerowane scenariusze"
- Typ encji: scenario
- Źródło: [ID twojego kroku "Wygeneruj Kurwa Scenariusze"]
- Ścieżka odpowiedzi: response.scenarios
- Pola podglądu: title, description, objective, connections
- Wymagaj potwierdzenia: Tak
- Metoda zapisu: addScenario
- Transformer danych:
```javascript
items => items.map(item => ({
  ...item,
  id: item.id || `scenario-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  progress: 0,
  tasks: 0,
  completedTasks: 0,
  dueDate: (() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  })(),
  connections: item.connections || []
}))
```

I chuj. To wszystko.