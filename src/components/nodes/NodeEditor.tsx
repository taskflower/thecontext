// components/nodes/NodeEditor.tsx
import React, { ChangeEvent } from 'react';
import useStore from '@/store';

interface FormFieldProps {
  label: string;
  name?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: "text" | "number" | "email" | "password";
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
  
  if (!nodeForm) return null;
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    useStore.setState({ nodeForm: { ...nodeForm, [name]: value } });
  };
  
  const handleCancel = () => {
    useStore.setState({ nodeForm: null });
    setView('flow');
  };
  
  return (
    <div className="p-8 bg-[hsl(var(--background))]">
      <h1 className="text-2xl font-semibold mb-6">Edycja węzła: {nodeForm.label}</h1>
      
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <form onSubmit={(e) => { e.preventDefault(); updateNode(); }}>
          <FormField
            label="Etykieta"
            name="label"
            value={nodeForm.label}
            onChange={handleChange}
            placeholder="Etykieta węzła"
            required
          />
          
          <FormField
            label="Opis"
            name="description"
            value={nodeForm.description}
            onChange={handleChange}
            placeholder="Opcjonalny opis"
          />
          
          <FormField
            label="Wiadomość asystenta"
            name="assistantMessage"
            value={nodeForm.assistantMessage}
            onChange={handleChange}
            placeholder="Wiadomość wyświetlana użytkownikowi"
            rows={6}
            hint="Użyj {{nazwa_zmiennej}} aby wstawić wartość z kontekstu."
          />
          
          <FormField
            label="Klucz kontekstu"
            name="contextKey"
            value={nodeForm.contextKey}
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
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-opacity-90 px-4 py-2"
            >Zapisz</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NodeEditor;