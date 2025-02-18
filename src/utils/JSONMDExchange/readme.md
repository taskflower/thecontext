Poniżej przykład podziału na bibliotekę (logikę konwersji) oraz komponent, który z niej korzysta:

---

```jsx
// src/lib/universalConverter.js

export const jsToMarkdown = (data, level = 1) => {
  let markdown = '';

  const processValue = (value, key, currentLevel) => {
    // Zawsze tworzymy nagłówek dla klucza
    markdown += `${'#'.repeat(currentLevel)} ${key}\n\n`;

    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        // Dla tablic tworzymy listę
        value.forEach(item => {
          markdown += `- ${item}\n`;
        });
        markdown += '\n';
      } else {
        // Dla obiektów rekurencyjnie przetwarzamy zawartość
        markdown += jsToMarkdown(value, currentLevel + 1);
      }
    } else {
      // Dla typów prostych (string, number) tworzymy paragraf
      markdown += `${value}\n\n`;
    }
  };

  for (const [key, value] of Object.entries(data)) {
    processValue(value, key, level);
  }

  return markdown;
};

export const markdownToJs = (markdown) => {
  const lines = markdown.split('\n').filter(line => line.trim());
  const result = {};
  let currentPath = [];
  let currentList = [];
  let currentValue = '';

  const addValueToObject = (path, value) => {
    let current = result;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    const lastKey = path[path.length - 1];

    // Jeśli mamy listę, używamy jej
    if (currentList.length > 0) {
      current[lastKey] = currentList;
      currentList = [];
    } 
    // Jeśli mamy wartość, próbujemy ją skonwertować na odpowiedni typ
    else if (value.trim()) {
      const trimmedValue = value.trim();
      if (trimmedValue === 'true') current[lastKey] = true;
      else if (trimmedValue === 'false') current[lastKey] = false;
      else if (!isNaN(trimmedValue)) current[lastKey] = Number(trimmedValue);
      else current[lastKey] = trimmedValue;
    }
  };

  lines.forEach(line => {
    if (line.startsWith('#')) {
      // Zapisz poprzednią wartość jeśli istnieje
      if (currentValue && currentPath.length > 0) {
        addValueToObject(currentPath, currentValue);
        currentValue = '';
      }

      // Obsługa nagłówków
      const level = line.match(/^#+/)[0].length;
      const title = line.slice(level).trim();

      // Aktualizuj ścieżkę
      currentPath = currentPath.slice(0, level - 1);
      currentPath.push(title);
    } else if (line.startsWith('-')) {
      // Element listy
      currentList.push(line.slice(1).trim());
    } else if (line.trim()) {
      // Zbieramy treść paragrafu
      currentValue += (currentValue ? '\n' : '') + line.trim();
    }
  });

  // Zapisz ostatnią wartość
  if (currentValue && currentPath.length > 0) {
    addValueToObject(currentPath, currentValue);
  }

  return result;
};
```

---

```jsx
// src/components/UniversalConverter.jsx

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { jsToMarkdown, markdownToJs } from '@/lib/universalConverter';

const UniversalConverter = () => {
  const [jsObject, setJsObject] = useState({
    "Projekty": {
      "Frontend": {
        "Mobile": {
          "nazwa": "Aplikacja mobilna XYZ",
          "wersja": 2.1,
          "technologie": ["React Native", "TypeScript"],
          "deployment": {
            "ios": "App Store",
            "android": "Google Play",
            "wersjaMin": 1.5
          }
        },
        "Web": {
          "nazwa": "Portal klienta",
          "wersja": 3.0,
          "stack": ["Next.js", "Tailwind"],
          "status": "produkcja"
        }
      }
    }
  });

  const [markdownText, setMarkdownText] = useState(() => {
    try {
      return jsToMarkdown(jsObject);
    } catch (error) {
      console.error('Initial conversion error:', error);
      return '';
    }
  });

  const handleJsChange = (e) => {
    try {
      const newJs = JSON.parse(e.target.value);
      setJsObject(newJs);
      const newMarkdown = jsToMarkdown(newJs);
      setMarkdownText(newMarkdown);
    } catch (error) {
      console.error('JSON parsing error:', error);
    }
  };

  const handleMarkdownChange = (e) => {
    const newMarkdown = e.target.value;
    setMarkdownText(newMarkdown);
    try {
      const newJs = markdownToJs(newMarkdown);
      setJsObject(newJs);
    } catch (error) {
      console.error('Markdown conversion error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="mb-2 font-semibold">JSON</h3>
              <textarea
                className="w-full h-96 p-2 border rounded font-mono text-sm"
                value={JSON.stringify(jsObject, null, 2)}
                onChange={handleJsChange}
                placeholder="Wpisz dowolny JSON..."
              />
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Markdown</h3>
              <textarea
                className="w-full h-96 p-2 border rounded font-mono text-sm"
                value={markdownText}
                onChange={handleMarkdownChange}
                placeholder="Markdown będzie tu..."
              />
            </div>
          </div>
        </CardContent>  
      </Card>
    </div>
  );
};

export default UniversalConverter;
```

---

**Jak to działa?**

1. **Biblioteka (`universalConverter.js`)**  
   Zawiera funkcje `jsToMarkdown` oraz `markdownToJs`, które odpowiadają za konwersję między obiektem JavaScript a formatem Markdown.

2. **Komponent (`UniversalConverter.jsx`)**  
   Komponent importuje funkcje z biblioteki. Użytkownik może edytować zarówno JSON, jak i Markdown – przy każdej zmianie wykonywana jest konwersja i synchronizacja stanów.

Takie rozdzielenie pozwala na wielokrotne wykorzystanie logiki konwersji w innych komponentach lub projektach.