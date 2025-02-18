# LLM Schema Converter

Moduł pozwalający na definicję i walidację struktury odpowiedzi z modeli LLM przy użyciu składni Markdown.

## Koncepcja

Zamiast kodować na sztywno oczekiwaną strukturę JSON odpowiedzi z LLM, definiujemy ją w przyjaznym formacie Markdown:

```markdown
# Response
## answer
string
## confidence
number(min=0,max=1)
## tokens
array[string]
```

Markdown automatycznie konwertowany jest do schematu walidacji, który można wykorzystać do weryfikacji odpowiedzi z dowolnego LLM.

## Przykład użycia

```javascript
import { parseSchemaFromMarkdown, validateAgainstSchema } from '@/lib/schemaConverter';

// 1. Definiujemy schemat w Markdown
const schema = `
# Response
## answer
string(min=1)
## confidence
number(min=0,max=1)
## metadata
### model
string
### timestamp
string(pattern=^\\d{4}-\\d{2}-\\d{2}$)
`;

// 2. Parsujemy schemat
const validationSchema = parseSchemaFromMarkdown(schema);

// 3. Używamy w zapytaniu do LLM
const queryLLM = async (prompt) => {
  // Dodajemy instrukcje dotyczące formatu do promptu
  const formattedPrompt = `
    Odpowiedz zgodnie z następującą strukturą:
    ${schema}
    
    Prompt: ${prompt}
  `;

  const response = await llm.generate(formattedPrompt);
  
  // Walidujemy odpowiedź
  const errors = validateAgainstSchema(response, validationSchema);
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
  
  return response;
};
```

## Składnia schematu

### Podstawowe typy
```markdown
# Field
string
number
boolean
```

### Tablice
```markdown
# Tags
array[string]
```

### Walidacja
```markdown
# Price
number(min=0,max=1000)

# Email
string(pattern=^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$)
```

### Zagnieżdżone obiekty
```markdown
# Response
## metadata
### timestamp
string
### version
number
```

## Zalety

1. **Czytelność** - struktura jest zrozumiała dla człowieka i maszyny
2. **Elastyczność** - łatwa modyfikacja bez zmian w kodzie
3. **Dokumentacja** - schemat Markdown służy jednocześnie jako dokumentacja
4. **Walidacja** - automatyczna weryfikacja zgodności odpowiedzi
5. **Prompting** - schemat można bezpośrednio wykorzystać jako część promptu

## Rozszerzanie

Moduł można łatwo rozszerzyć o:
- Dodatkowe reguły walidacji
- Nowe typy danych
- Transformacje danych
- Generowanie TypeScript types

## Autor koncepcji
dadmor@gmail.com