// src/themes/default/widgets/form/userSelect.tsx
import { useCollections } from "@/core";

interface UserSelectFieldWidgetProps {
  title?: string;
  attrs: {
    fieldKey: string;
    field: any;
    value: any;
    onChange: (key: string, value: any) => void;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    allowEmpty?: boolean;
  };
}

export default function UserSelectFieldWidget({ title, attrs }: UserSelectFieldWidgetProps) {
  const { fieldKey, field, value, onChange, required, disabled, placeholder, className, allowEmpty = true } = attrs;
  
  // Pobierz listę użytkowników
  const { items: users, loading } = useCollections("users");
  
  // Funkcja do formatowania nazwy użytkownika
  const formatUserName = (user: any) => {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const role = user.role ? ` (${user.role})` : '';
    const department = user.department ? ` - ${user.department}` : '';
    return `${name}${role}${department}`;
  };

  // Filtruj tylko aktywnych użytkowników
  const activeUsers = users.filter((user: any) => user.isActive !== false);

  // Sortuj użytkowników alfabetycznie
  const sortedUsers = activeUsers.sort((a: any, b: any) => {
    const nameA = `${a.lastName || ''} ${a.firstName || ''}`.trim();
    const nameB = `${b.lastName || ''} ${b.firstName || ''}`.trim();
    return nameA.localeCompare(nameB);
  });

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700">
          {title || field.label || fieldKey}
          {(required ?? field.required) && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="w-full px-3 py-2 text-sm border border-zinc-300/80 rounded-md bg-zinc-50 text-zinc-500">
          Ładowanie użytkowników...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700">
        {title || field.label || fieldKey}
        {(required ?? field.required) && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        disabled={disabled}
        className={className || "w-full px-3 py-2 text-sm border border-zinc-300/80 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400 bg-white"}
        required={required ?? field.required}
      >
        {allowEmpty && (
          <option value="">{placeholder || "Wybierz użytkownika"}</option>
        )}
        {sortedUsers.map((user: any) => (
          <option key={user.id} value={user.id}>
            {formatUserName(user)}
          </option>
        ))}
      </select>
      
      {/* Pokaż informacje o aktualnie wybranym użytkowniku */}
      {value && (
        <div className="text-xs text-zinc-500">
          {(() => {
            const selectedUser = users.find((u: any) => u.id === value);
            if (!selectedUser) return "Użytkownik nie znaleziony";
            return `Email: ${selectedUser.email || 'brak'} | Dział: ${selectedUser.department || 'brak'}`;
          })()}
        </div>
      )}
      
      {field.description && (
        <p className="text-xs text-zinc-500">{field.description}</p>
      )}
      
      {field.error && (
        <p className="text-xs text-red-500">{field.error}</p>
      )}
    </div>
  );
}