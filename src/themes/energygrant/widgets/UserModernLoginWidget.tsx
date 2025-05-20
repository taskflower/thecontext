// src/themes/default/widgets/ModernLoginWidget.tsx
import { useState } from 'react';
import { useAuthContext } from "@/auth/AuthContext";
import { useFlow } from "@/core";
import { useAppNavigation } from "@/core/navigation";
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  ArrowRight,
  AlertCircle,
  Loader,
  CheckCircle,
  LogOut
} from 'lucide-react';

type ModernLoginWidgetProps = {
  successPath?: string;
  dataPath?: string;
  profilePath?: string;
  enableEmailLogin?: boolean;
  enableGoogleLogin?: boolean;
  showRegistration?: boolean;
  title?: string;
  subtitle?: string;
};

export default function ModernLoginWidget({
  successPath = '',
  dataPath = 'user-data',
  profilePath = 'user-profile',
  enableEmailLogin = false,
  enableGoogleLogin = true,
  showRegistration = false,
  title = 'Logowanie',
  subtitle = 'Zaloguj się, aby kontynuować'
}: ModernLoginWidgetProps) {
  const { loading, signInWithGoogle, signInWithEmailAndPassword, signOut, user } = useAuthContext();
  const { get, set } = useFlow();
  const { navigateTo } = useAppNavigation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Zapisuje dane użytkownika do kontekstu
  const saveUserDataToContext = () => {
    if (user) {
      // Zapisz dane logowania
      if (dataPath) {
        set(`${dataPath}.email`, user.email);
        set(`${dataPath}.id`, user.uid);
        set(`${dataPath}.isLoggedIn`, true);
        set(`${dataPath}.lastLoginDate`, new Date().toISOString());
      }

      // Zapisz imię i nazwisko
      if (profilePath && user.displayName) {
        const nameParts = user.displayName.split(" ");
        if (nameParts.length > 0) {
          set(`${profilePath}.firstName`, nameParts[0]);
          if (nameParts.length > 1) {
            set(`${profilePath}.lastName`, nameParts.slice(1).join(" "));
          }
        }
        set(`${profilePath}.id`, user.uid);
      }

      console.log("Zapisano dane użytkownika do kontekstów");
    }
  };

  // Obsługa logowania Google
  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await signInWithGoogle();
      saveUserDataToContext();
      setIsSuccess(true);
      
      // Automatyczne przekierowanie po sukcesie
      if (successPath) {
        setTimeout(() => {
          navigateTo(successPath);
        }, 1500);
      }
    } catch (err) {
      setError('Wystąpił błąd podczas logowania przez Google. Spróbuj ponownie.');
      console.error('Google login failed', err);
    }
  };

  // Obsługa logowania przez e-mail i hasło
  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('Wprowadź adres e-mail i hasło');
      return;
    }

    try {
      setError(null);
      await signInWithEmailAndPassword(email, password);
      saveUserDataToContext();
      setIsSuccess(true);
      
      // Automatyczne przekierowanie po sukcesie
      if (successPath) {
        setTimeout(() => {
          navigateTo(successPath);
        }, 1500);
      }
    } catch (err) {
      setError('Nieprawidłowy adres e-mail lub hasło. Spróbuj ponownie.');
      console.error('Email login failed', err);
    }
  };

  // Obsługa wylogowania
  const handleLogout = async () => {
    try {
      await signOut();
      if (dataPath) {
        set(`${dataPath}.isLoggedIn`, false);
      }
      setIsSuccess(false);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // Przekierowanie po zalogowaniu
  const handleContinue = () => {
    if (successPath) {
      navigateTo(successPath);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6">
        {/* Tytuł widgetu */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
        </div>
        
        {loading ? (
          // Stan ładowania
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Loader className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <p className="text-gray-600">Trwa logowanie...</p>
          </div>
        ) : user ? (
          // Użytkownik zalogowany
          <div className="flex flex-col items-center py-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isSuccess ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {isSuccess ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            
            <h4 className="text-lg font-semibold text-gray-900 mb-1">
              {isSuccess ? 'Logowanie pomyślne!' : `Witaj, ${user.displayName || user.email}`}
            </h4>
            
            <p className="text-sm text-gray-600 mb-6">
              {isSuccess 
                ? 'Za chwilę zostaniesz przekierowany...' 
                : 'Jesteś zalogowany na konto:'}
            </p>
            
            {!isSuccess && (
              <div className="bg-gray-50 w-full p-4 rounded-lg border border-gray-200 mb-6">
                <p className="text-sm text-gray-700 flex items-center">
                  <Mail className="w-4 h-4 text-gray-500 mr-2" /> {user.email}
                </p>
              </div>
            )}
            
            <div className="flex space-x-4 w-full">
              {!isSuccess && (
                <>
                  <button
                    onClick={handleContinue}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
                  >
                    Kontynuuj <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-md flex items-center justify-center border border-red-200"
                  >
                    <LogOut className="mr-2 w-4 h-4" /> Wyloguj się
                  </button>
                </>
              )}
              
              {isSuccess && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: '100%' }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Formularz logowania
          <div>
            {/* Komunikat o błędzie */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            {/* Logowanie Google */}
            {enableGoogleLogin && (
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center py-3 px-4 mb-4 rounded-md border text-sm font-medium bg-white border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Kontynuuj z Google
              </button>
            )}
            
            {/* Separator */}
            {enableGoogleLogin && enableEmailLogin && (
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-white text-xs text-gray-500 uppercase">lub</span>
                </div>
              </div>
            )}
            
            {/* Logowanie przez e-mail */}
            {enableEmailLogin && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Adres e-mail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="twój@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Hasło
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="••••••••••"
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <button
                    onClick={handleEmailLogin}
                    className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Zaloguj się
                  </button>
                </div>
              </div>
            )}
            
            {/* Odnośnik do rejestracji */}
            {showRegistration && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Nie masz jeszcze konta?{' '}
                  <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                    Zarejestruj się <UserPlus className="ml-1 w-4 h-4 inline" />
                  </a>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}