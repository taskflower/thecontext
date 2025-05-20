# Dokumentacja mechanizmu nawigacji w LoginWidget

## Funkcja `buildNavigationPath`

W LoginWidget, mechanizm nawigacji został wyodrębniony do dedykowanej funkcji `buildNavigationPath`, która obsługuje różne przypadki użycia parametru `successPath`.

```typescript
const buildNavigationPath = (
  successPath: string | undefined, 
  configId: string, 
  defaultPath: string, 
  get: (path: string) => any
): string
```

### Parametry:

- **successPath** - Ścieżka nawigacji, może zawierać zmienne w formacie `{{data.path}}`
- **configId** - ID konfiguracji, potrzebne do konstruowania pełnych ścieżek
- **defaultPath** - Domyślna ścieżka używana, gdy `successPath` nie jest podany
- **get** - Funkcja do pobierania wartości z kontekstu aplikacji

### Zachowanie:

1. **Brak ścieżki**: Gdy `successPath` nie jest podany, funkcja zwraca `defaultPath`
   ```
   successPath: undefined → defaultPath
   ```

2. **Interpolacja zmiennych**: Zastępuje wszystkie wystąpienia `{{data.path}}` wartościami z kontekstu
   ```
   successPath: "{{userData.preferredWorkspace}}" → "my-workspace"
   ```

3. **Dodawanie prefixu**: Jeśli przetworzona ścieżka nie zaczyna się od "/", dodaje prefix `/${configId}/`
   ```
   successPath: "workspace-name" → "/configId/workspace-name"
   ```

4. **Ścieżki bezwzględne**: Jeśli ścieżka zaczyna się od "/", używa jej bez zmian
   ```
   successPath: "/dashboard" → "/dashboard"
   ```

## Przypadki użycia w konfiguracji:

### 1. Przejście do następnego kroku (domyślne zachowanie)
```json
{
  "tplFile": "LoginWidget",
  "successPath": null
}
```

### 2. Przejście do konkretnego workspace
```json
{
  "tplFile": "LoginWidget",
  "successPath": "workspace-user-auth"
}
```

### 3. Przejście do konkretnego scenariusza
```json
{
  "tplFile": "LoginWidget",
  "successPath": "workspace-user-auth/scenario-name"
}
```

### 4. Przejście do konkretnego kroku w scenariuszu
```json
{
  "tplFile": "LoginWidget",
  "successPath": "workspace-user-auth/scenario-name/2"
}
```

### 5. Dynamiczna ścieżka z kontekstu
```json
{
  "tplFile": "LoginWidget",
  "successPath": "{{userData.preferredWorkspace}}/{{userData.lastScenario}}"
}
```

### 6. Ścieżka bezwzględna
```json
{
  "tplFile": "LoginWidget",
  "successPath": "/dashboard"
}
```