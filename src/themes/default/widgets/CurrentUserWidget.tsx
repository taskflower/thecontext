// src/themes/default/widgets/CurrentUserWidget.tsx
import { useEngineStore, useAppNavigation } from "@/core";

interface CurrentUserWidgetProps {
  title?: string;
  attrs?: {
    currentUserPath?: string;
    showActions?: boolean;
    editNavPath?: string;
    logoutNavPath?: string;
    variant?: "compact" | "detailed";
    colSpan?: string | number;
  };
}

export default function CurrentUserWidget({ 
  title = "Zalogowany użytkownik", 
  attrs = {} 
}: CurrentUserWidgetProps) {
  const { get, set } = useEngineStore();
  const { go } = useAppNavigation();
  
  const {
    currentUserPath = "currentUser",
    showActions = true,
    editNavPath = "users/profile/edit",
    logoutNavPath = "users/login/form",
    variant = "detailed"
  } = attrs;

  const currentUser = get(currentUserPath);

  const handleLogout = () => {
    set(currentUserPath, null);
    go(`/:config/${logoutNavPath}`);
  };

  const handleEdit = () => {
    go(`/:config/${editNavPath}`);
  };

  if (!currentUser) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-yellow-800">Nie jesteś zalogowany</p>
            <button
              onClick={() => go(`/:config/${logoutNavPath}`)}
              className="text-xs text-yellow-600 hover:text-yellow-800 underline mt-1"
            >
              Zaloguj się
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="bg-white border border-zinc-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-sm font-medium text-zinc-600">
                {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">
                {currentUser.firstName} {currentUser.lastName}
              </p>
              <p className="text-xs text-zinc-500">{currentUser.role}</p>
            </div>
          </div>
          {showActions && (
            <button
              onClick={handleLogout}
              className="text-xs text-zinc-500 hover:text-zinc-700"
            >
              Wyloguj
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-zinc-900">{title}</h3>
        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Edytuj
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Wyloguj
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mr-4">
            <span className="text-xl font-medium text-zinc-600">
              {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
            </span>
          </div>
          <div>
            <h4 className="text-lg font-medium text-zinc-900">
              {currentUser.firstName} {currentUser.lastName}
            </h4>
            <p className="text-sm text-zinc-600">{currentUser.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Rola</p>
            <p className="text-sm text-zinc-900 mt-1">
              {currentUser.role ? 
                currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 
                'Brak'
              }
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Dział</p>
            <p className="text-sm text-zinc-900 mt-1">
              {currentUser.department ? 
                currentUser.department.charAt(0).toUpperCase() + currentUser.department.slice(1) : 
                'Brak'
              }
            </p>
          </div>
          {currentUser.phone && (
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Telefon</p>
              <p className="text-sm text-zinc-900 mt-1">{currentUser.phone}</p>
            </div>
          )}
          {currentUser.startDate && (
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Zatrudniony od</p>
              <p className="text-sm text-zinc-900 mt-1">
                {new Date(currentUser.startDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {currentUser.loginTime && (
          <div className="pt-4 border-t border-zinc-200">
            <p className="text-xs text-zinc-500">
              Zalogowano: {new Date(currentUser.loginTime).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}