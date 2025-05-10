// src/debug/tabs/UserTab.tsx
import React, { useState, useEffect } from 'react';
import { User as UserIcon, LogOut, RefreshCw, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';

const UserTab: React.FC = () => {
  const { user, loading, signInWithGoogle, signOut, getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [loadingToken, setLoadingToken] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  // Function to load or refresh user token
  const handleLoadToken = async () => {
    if (!user) return;
    
    setLoadingToken(true);
    try {
      const fetchedToken = await getToken();
      setToken(fetchedToken);
    } catch (error) {
      console.error("Nie udało się pobrać tokenu:", error);
    } finally {
      setLoadingToken(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Logowanie przez Google nie powiodło się:", error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      setToken(null);
    } catch (error) {
      console.error("Wylogowanie nie powiodło się:", error);
    }
  };

  // Copy token to clipboard
  const copyTokenToClipboard = () => {
    if (!token) return;
    
    navigator.clipboard.writeText(token)
      .then(() => {
        setTokenCopied(true);
        setTimeout(() => setTokenCopied(false), 2000);
      })
      .catch(err => {
        console.error('Nie udało się skopiować tokenu:', err);
      });
  };

  // Format displayed token
  const formatToken = (token: string) => {
    if (!showToken) {
      return token.substring(0, 10) + '...' + token.substring(token.length - 10);
    }
    return token;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Ładowanie...</div>
      </div>
    );
  }

  // User not logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Zaloguj się do Context Inspector
          </h3>
          <p className="text-gray-600 mb-4">
            Zaloguj się, aby uzyskać dostęp do wszystkich funkcji
          </p>
          <button
            onClick={handleGoogleLogin}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center w-full"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Zaloguj się przez Google
          </button>
        </div>
      </div>
    );
  }

  // User logged in - display user information
  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold">Informacje o użytkowniku</h2>
        <button
          onClick={handleLogout}
          className="px-2 py-1 text-xs text-red-700 bg-red-50 rounded border border-red-200 hover:bg-red-100 flex items-center"
        >
          <LogOut className="w-3 h-3 mr-1" />
          Wyloguj się
        </button>
      </div>

      <div className="border rounded-md overflow-hidden mb-4">
        <div className="p-4 flex items-center">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Zdjęcie profilowe" 
              className="w-16 h-16 rounded-full mr-4"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
              <UserIcon className="w-8 h-8 text-gray-500" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg">{user.displayName || 'Użytkownik'}</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="border-t">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm font-semibold text-gray-500">ID użytkownika</td>
                <td className="px-4 py-3 text-sm text-gray-900 font-mono">{user.uid}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-semibold text-gray-500">Email zweryfikowany</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {user.emailVerified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      Tak
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                      Nie
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-semibold text-gray-500">Dostawca</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {user.providerData && user.providerData.length > 0 ? (
                    user.providerData[0].providerId
                  ) : (
                    'Brak danych'
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-semibold text-gray-500">Utworzony</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {user.metadata?.creationTime ? (
                    new Date(user.metadata.creationTime).toLocaleString('pl-PL')
                  ) : (
                    'Brak danych'
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-semibold text-gray-500">Ostatnie logowanie</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {user.metadata?.lastSignInTime ? (
                    new Date(user.metadata.lastSignInTime).toLocaleString('pl-PL')
                  ) : (
                    'Brak danych'
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Authentication Token Section */}
      <div className="border rounded-md overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">Authentication Token (dla LLM API)</h3>
        </div>
        
        <div className="p-4">
          {!token ? (
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-3">
                Token jest używany do uwierzytelniania żądań do API. Kliknij przycisk poniżej, aby wygenerować token.
              </p>
              <button
                onClick={handleLoadToken}
                disabled={loadingToken}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loadingToken ? (
                  <>
                    <RefreshCw className="animate-spin -ml-0.5 mr-2 h-4 w-4" />
                    Ładowanie...
                  </>
                ) : (
                  <>
                    <RefreshCw className="-ml-0.5 mr-2 h-4 w-4" />
                    Wygeneruj Token
                  </>
                )}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-3">
                <div className="text-sm text-gray-700 font-mono bg-gray-50 py-2 px-3 rounded flex-grow overflow-auto">
                  {formatToken(token)}
                </div>
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="ml-2 p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                  title={showToken ? "Ukryj token" : "Pokaż token"}
                >
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={copyTokenToClipboard}
                  className="ml-1 p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                  title="Kopiuj do schowka"
                >
                  {tokenCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
              <div className="flex justify-between">
                <p className="text-xs text-gray-500">
                  Token jest ważny przez ok. 1 godzinę od wygenerowania.
                </p>
                <button
                  onClick={handleLoadToken}
                  disabled={loadingToken}
                  className="inline-flex items-center px-2 py-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                >
                  {loadingToken ? (
                    <>
                      <RefreshCw className="animate-spin mr-1 h-3 w-3" />
                      Odświeżanie...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Odśwież
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserTab;