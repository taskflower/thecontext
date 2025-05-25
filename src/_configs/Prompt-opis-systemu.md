## Prompt: React Router App dla Systemu Konfigurowalnych Workspace'ów

Stworzony kod to aplikacja React z TypeScript obsługująca dynamiczne ładowanie konfiguracji i szablonów na podstawie parametrów URL.

### Struktura URL:
- `/:config/:workspace` - wyświetla workspace z odpowiednim layoutem i widgetami
- `/:config/:workspace/:scenario/:step` - wyświetla konkretny krok scenariusza

### Struktura plików:

**Konfiguracje:**
```
src/configs/{configId}/
├── app.json
├── workspaces/{workspaceId}.json
└── scenarios/{workspaceId}/{scenarioId}.json
```

**Szablony:**
```
src/themes/{tplDir}/
├── layouts/{LayoutName}.tsx
├── steps/{StepName}.tsx
└── widgets/{WidgetName}.tsx
```

### Przykładowe konfiguracje:

**app.json:**
```json
{
  "name": "Program Dotacji Energetycznych",
  "tplDir": "energygrant",
  "defaultWorkspace": "workspace-user",
  "defaultScenario": "user-registration"
}
```

**workspace-user.json:**
```json
{
  "id": "workspace-user",
  "name": "Panel Użytkownika", 
  "templateSettings": {
    "layoutFile": "Public",
    "widgets": [
      {
        "tplFile": "LoginWidget",
        "redirectUrl": "/dashboard",
        "colSpan": "full"
      }
    ]
  },
  "contextSchema": {
    "type": "object",
    "properties": {
      "user-profile": {
        "type": "object",
        "properties": {
          "email": { "type": "string", "title": "Email" },
          "firstName": { "type": "string", "title": "Imię" },
          "lastName": { "type": "string", "title": "Nazwisko" }
        }
      }
    }
  }
}
```

**user-registration.json:**
```json
{
  "id": "user-registration",
  "slug": "user-registration",
  "name": "Rejestracja użytkownika",
  "nodes": [
    {
      "slug": "role-selection",
      "label": "Wybór roli",
      "tplFile": "WidgetsStep",
      "order": 0,
      "attrs": {
        "title": "Wybierz rolę",
        "widgets": [
          {
            "tplFile": "UserInteractiveRoleSelectorWidget",
            "colSpan": "full"
          }
        ]
      }
    },
    {
      "slug": "registration-consent", 
      "label": "Dane osobowe",
      "tplFile": "FormStep",
      "order": 3,
      "attrs": {
        "title": "Dane osobowe",
        "customFields": {
          "firstName": { "type": "string", "title": "Imię", "required": true },
          "lastName": { "type": "string", "title": "Nazwisko", "required": true }
        }
      }
    }
  ]
}
```

### Jak działa:

1. **URL** `http://localhost:5173/energyGrantApp/workspace-user`:
   - Ładuje `./configs/energyGrantApp/app.json` (pobiera `tplDir: "energygrant"`)
   - Ładuje `./configs/energyGrantApp/workspaces/workspace-user.json`
   - Dynamicznie importuje layout: `./themes/energygrant/layouts/Public.tsx`
   - Dynamicznie importuje widgety: `./themes/energygrant/widgets/LoginWidget.tsx`

2. **URL** `http://localhost:5173/energyGrantApp/workspace-user/user-registration/role-selection`:
   - Ładuje konfigurację scenariusza z `./configs/energyGrantApp/scenarios/workspace-user/user-registration.json`
   - Znajduje node o `slug: "role-selection"`
   - Dynamicznie importuje step: `./themes/energygrant/steps/WidgetsStep.tsx`
   - Przekazuje całą konfigurację node'a jako props

Wszystkie importy są dynamiczne, co pozwala na pełną konfigurowalność bez przebudowy aplikacji.