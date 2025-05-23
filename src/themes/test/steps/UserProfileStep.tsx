// ------ src/themes/test/steps/UserProfileStep.tsx ------


import { useAppNavigation } from "@/engine";
import { useMockAuth } from "../useMockAuth";

interface UserProfileStepProps {
  attrs?: {
    title?: string;
  };
}

export default function UserProfileStep({ attrs }: UserProfileStepProps) {
  const { user, logout } = useMockAuth();
  const { navigateTo } = useAppNavigation();

  if (!user) {
    navigateTo("users/login-email");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigateTo("users/login-email");
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {attrs?.title && (
        <h1 className="text-3xl font-bold mb-6">{attrs.title}</h1>
      )}

      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold">Informacje o użytkowniku</h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Wyloguj się
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Dane systemowe</h3>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-600">ID:</span> {user.id}</div>
              <div><span className="text-gray-600">Email:</span> {user.email}</div>
              <div><span className="text-gray-600">Rola:</span> {user.role}</div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Dane kontaktowe</h3>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-600">Imię:</span> {user.firstName}</div>
              <div><span className="text-gray-600">Nazwisko:</span> {user.lastName}</div>
              {user.phone && <div><span className="text-gray-600">Telefon:</span> {user.phone}</div>}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <button
            onClick={() => navigateTo("tickets/list")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Przejdź do zgłoszeń
          </button>
        </div>
      </div>
    </div>
  );
}