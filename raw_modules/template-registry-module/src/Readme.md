# template-registry-module

Moduł rejestru szablonów służący do zarządzania komponentami interfejsu użytkownika w aplikacjach opartych na przepływach.

## Instalacja

```bash
npm install template-registry-module
```

## Opis

Ten moduł zapewnia system rejestrowania i zarządzania różnymi typami szablonów używanych w aplikacji:

- Szablony layoutów (układów strony)
- Szablony widgetów (komponentów wyświetlających dane)
- Szablony kroków przepływu (interaktywnych etapów w przepływie aplikacji)

Dzięki temu modułowi, możesz łatwo tworzyć, rejestrować i używać szablonów w swojej aplikacji.

## Główne funkcje

- Rejestrowanie i pobieranie szablonów
- Kategoryzowanie szablonów według typu i przeznaczenia
- Automatyczne fallbacki do domyślnych szablonów
- Walidacja poprawności szablonów
- Wsparcie dla React i TypeScript

## Przykład użycia

```typescript
import { 
  createTemplateRegistry, 
  LayoutTemplate, 
  WidgetTemplate, 
  FlowStepTemplate 
} from 'template-registry-module';
import DefaultLayout from './components/layouts/DefaultLayout';
import CardListWidget from './components/widgets/CardListWidget';
import BasicStepTemplate from './components/flowSteps/BasicStepTemplate';

// Utwórz rejestr szablonów
const templateRegistry = createTemplateRegistry();

// Zarejestruj szablony
templateRegistry.registerLayout({
  id: 'default',
  name: 'Default Layout',
  component: DefaultLayout
});

templateRegistry.registerWidget({
  id: 'card-list',
  name: 'Card List',
  category: 'scenario',
  component: CardListWidget
});

templateRegistry.registerFlowStep({
  id: 'basic-step',
  name: 'Basic Step',
  component: BasicStepTemplate,
  compatibleNodeTypes: ['default', 'input']
});

// Użyj szablonów w aplikacji
const LayoutComponent = templateRegistry.getLayout('default')?.component;
const WidgetComponent = templateRegistry.getWidget('card-list')?.component;
const FlowStepComponent = templateRegistry.getFlowStep('basic-step')?.component;

// Możesz również znaleźć kompatybilny szablon dla typu węzła
const nodeType = 'input';
const CompatibleComponent = templateRegistry.getFlowStepForNodeType(nodeType)?.component;
```

## API

### TemplateRegistry

Główna klasa do zarządzania szablonami.

#### Metody

- `registerLayout(template: LayoutTemplate)` - Rejestruje szablon layoutu
- `registerWidget(template: WidgetTemplate)` - Rejestruje szablon widgetu
- `registerFlowStep(template: FlowStepTemplate)` - Rejestruje szablon kroku przepływu
- `getLayout(id: string)` - Pobiera szablon layoutu po ID
- `getWidget(id: string)` - Pobiera szablon widgetu po ID
- `getFlowStep(id: string)` - Pobiera szablon kroku przepływu po ID
- `getWidgetsByCategory(category: WidgetCategory)` - Pobiera szablony widgetów według kategorii
- `getFlowStepForNodeType(nodeType: string)` - Pobiera szablon kroku przepływu dla typu węzła

### Typy

- `LayoutTemplate` - Interfejs definiujący szablon layoutu
- `WidgetTemplate` - Interfejs definiujący szablon widgetu
- `FlowStepTemplate` - Interfejs definiujący szablon kroku przepływu
- `WidgetCategory` - Typ wyliczeniowy kategorii widgetów ('scenario', 'workspace', 'flow')

## Licencja

MIT