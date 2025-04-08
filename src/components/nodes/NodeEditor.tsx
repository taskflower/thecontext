// components/nodes/NodeEditor.tsx
import React, { ChangeEvent, useState, useEffect } from 'react';
import useStore from '@/store';
import { pluginRegistry } from '@/plugins';

interface FormFieldProps {
  label: string;
  name?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: "text" | "number" | "email" | "password" | "url";
  placeholder?: string;
  required?: boolean;
  rows?: number;
  hint?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  rows = 0,
  hint = "",
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2" htmlFor={name}>
      {label}
    </label>
    {rows > 0 ? (
      <textarea
        id={name}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="flex min-h-[80px] w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        rows={rows}
        required={required}
      />
    ) : (
      <input
        id={name}
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="flex h-10 w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        required={required}
      />
    )}
    {hint && <p className="mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>}
  </div>
);

const NodeEditor: React.FC = () => {
  const nodeForm = useStore(state => state.nodeForm);
  const updateNode = useStore(state => state.updateNode);
  const setView = useStore(state => state.setView);
  
  // Track form validation state
  const [isValid, setIsValid] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Moving this conditional check inside useEffect to fix the hook rule violation
  useEffect(() => {
    if (!nodeForm) return;
    
    // Podstawowa walidacja (etykieta)
    const basicValid = nodeForm.label.trim().length > 0;
    setIsValid(basicValid);
    
    // Specyficzna walidacja dla wtyczek
    if (nodeForm.pluginType) {
      const plugin = pluginRegistry.getPlugin(nodeForm.pluginType);
      if (plugin) {
        const validation = plugin.validateNodeData(nodeForm.pluginData || {});
        setIsValid(basicValid && validation.isValid);
        setValidationErrors(validation.errors || []);
      }
    } else {
      setValidationErrors([]);
    }
  }, [nodeForm]);
  
  // Early return after hooks are called
  if (!nodeForm) return null;
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Reset plugin data when changing plugin type
    const updatedForm = { 
      ...nodeForm, 
      [name]: value,
      // Jeśli zmienił się typ pluginu, resetuj dane pluginu
      ...(name === 'pluginType' ? { 
        pluginData: {}, 
        pluginConfig: null 
      } : {})
    };
    
    useStore.setState({ nodeForm: updatedForm });
  };
  
  const handleCancel = () => {
    useStore.setState({ nodeForm: null });
    setView('flow');
  };
  
  // Handler dla zmian w pluginie - przekazywany do formularza pluginu
  const handlePluginDataChange = (newPluginData: Record<string, any>) => {
    useStore.setState({
      nodeForm: {
        ...nodeForm,
        pluginData: newPluginData
      }
    });
  };
  
  // Renderuje formularz konfiguracyjny dla określonego pluginu
  const renderPluginForm = () => {
    if (!nodeForm.pluginType) return null;
    
    const plugin = pluginRegistry.getPlugin(nodeForm.pluginType);
    if (!plugin) return null;
    
    return plugin.renderConfigForm(nodeForm.pluginData, handlePluginDataChange);
  };
  
  return (
    <div className="p-8 bg-[hsl(var(--background))]">
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={handleCancel}
          className="text-[hsl(var(--primary))] hover:opacity-80 text-sm font-medium"
        >
          ← Powrót
        </button>
        <h1 className="text-2xl font-semibold">Edycja węzła: {nodeForm.label}</h1>
      </div>
      
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <form onSubmit={(e) => { e.preventDefault(); updateNode(); }}>
          <FormField
            label="Etykieta"
            name="label"
            value={nodeForm.label}
            onChange={handleChange}
            placeholder="Etykieta węzła"
            required
            hint="Nazwa węzła wyświetlana w interfejsie"
          />
          
          <FormField
            label="Opis"
            name="description"
            value={nodeForm.description || ''}
            onChange={handleChange}
            placeholder="Opcjonalny opis"
            hint="Krótki opis wyjaśniający cel tego węzła"
          />
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Typ węzła</label>
            <select
              name="pluginType"
              value={nodeForm.pluginType || ''}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              <option value="">Standardowy</option>
              {pluginRegistry.getAllPlugins().map(plugin => (
                <option key={plugin.id} value={plugin.id}>
                  {plugin.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">
              Wybierz specjalny typ węzła dla dodatkowej funkcjonalności
            </p>
          </div>
          
          {/* Dynamicznie renderuj formularz konfiguracyjny wybranego pluginu */}
          {renderPluginForm()}
          
          {/* Wyświetlanie błędów walidacji z pluginu */}
          {validationErrors.length > 0 && (
            <div className="mb-4 p-3 border border-red-300 bg-red-50 rounded-md">
              <p className="text-sm font-medium text-red-800 mb-1">Błędy konfiguracji:</p>
              <ul className="list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-xs text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <FormField
            label="Wiadomość asystenta"
            name="assistantMessage"
            value={nodeForm.assistantMessage || ''}
            onChange={handleChange}
            placeholder="Wiadomość wyświetlana użytkownikowi"
            rows={4}
            hint="Użyj {{nazwa_zmiennej}} aby wstawić wartość z kontekstu."
          />
          
          <FormField
            label="Klucz kontekstu"
            name="contextKey"
            value={nodeForm.contextKey || ''}
            onChange={handleChange}
            placeholder="Nazwa zmiennej kontekstowej (opcjonalnie)"
            hint="Jeśli wypełnione, odpowiedź użytkownika będzie zapisana pod tą nazwą."
          />
          
          <FormField
            label="Ścieżka JSON"
            name="contextJsonPath"
            value={nodeForm.contextJsonPath || ''}
            onChange={handleChange}
            placeholder="Ścieżka JSON dla zagnieżdżonych danych (opcjonalnie)"
            hint="Przykład: user.preferences.theme"
          />
          
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-opacity-80 px-4 py-2"
            >Anuluj</button>
            <button
              type="submit"
              disabled={!isValid}
              className={`inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-2 ${
                !isValid
                  ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed"
                  : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-opacity-90"
              }`}
            >Zapisz</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NodeEditor;